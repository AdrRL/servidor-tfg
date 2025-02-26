require('dotenv').config();

const fs = require("fs");
const express = require('express');
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");

const httpServer = require('http').Server(app);
const { Server } = require("socket.io");

const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const args = process.argv.slice(2);

const modelo = require("./app/servidor/modelo.js");

let io = new Server();

const PORT = process.env.PORT || 3000;

const haIniciado = function(request, response, next) 
{
    let token = request.headers.authorization && request.headers.authorization.split(' ')[1];
    if (request.method === 'OPTIONS') 
    {
        return next();
    }
    if (token) 
    {
        jwt.verify(token, "token", (err, decoded) => {
            if (decoded) 
            {
                next();
            } 
            else 
            {
                response.status(401).send({ "message": "No autorizado" });
            }
        });
    } 
    else 
    {
        response.status(401).send({ "message": "No autorizado" });
    }
}

const corsOptions = {
    origin: ['http://localhost:4200', 'https://servidor-tfg.onrender.com', 'https://angular-tfg.onrender.com'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

app.options('/*', cors(corsOptions), function(req, res, next) 
{
    res.sendStatus(200);
    console.log(res);
    next();
});

app.use(express.static(__dirname + "/"));
app.use(cookieSession({
    name: 'TFG',
    keys: ['key1', 'key2']
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let test = false;
test = eval(args[0]); // test=true test=false

let sistema = new modelo.Sistema(test);

app.get("/good", function(request, response) 
{
    let email = request.user.emails[0].value;
    sistema.usuarioGoogle({ "email": email }, function(usr) 
    {
        response.cookie('email', usr.email);
        response.redirect('/');
    });
});

app.get("/fallo", function(request, response) 
{
    response.send({ email: "nook" })
});

app.post("/registrarUsuario", function(request, response) 
{
    if (Object.keys(request.body).length === 0) 
    {
        return response.status(400).send({ "message": "Datos del registro no proporcionados" });
    }

    sistema.registrarUsuario(request.body, function(res) 
    {
        if (res.email == -1)
        {
            response.status(400).send({ "email": res.email, "message": "El email proporcionado ya tiene una cuenta" });
        }
        else if (res.email == -2)
        {
            response.status(400).send({ "email": res.email, "message": "El email se encuentra a espera de confirmación" });
        }
        else if (res.email == -3)
        {
            response.status(400).send({ "email": res.email, "message": "Nombre de usuario ya en uso" });
        }
        else 
        {
            response.json({ "email": res.email });

        }
    });
});

app.post("/agregarGoogleUser", function(request, response) 
{
    if (Object.keys(request.body).length === 0) 
    {
        return response.status(400).send({ "message": "Datos del login no proporcionados" });
    }

    sistema.usuarioGoogle(request.body, function(res) 
    {
        response.json({ "email": res.email, "token": res.token });
    });
});

app.post("/loginUsuario", function(request, response) 
{
    if (Object.keys(request.body).length === 0) 
    {
        return response.status(400).send({ "message": "Datos del login no proporcionados" });
    }

    if (request.method === 'OPTIONS') 
    {
        return response.sendStatus(200);
    }

    sistema.loginUsuarioEmail(request.body, function(res1) 
    {
        if (res1.clave != -1) 
        {
            response.json({ "clave": res1.email, "token": res1.token });
        } 
        else 
        {
            sistema.loginUsuarioUsername(request.body, function(res2) 
            {
                if (res2.clave != -1) 
                    response.json({ "clave": res2.email, "token": res2.token });
                else
                    return response.status(404).send({ "message": "Datos no coincidentes" });
            });
        }
    });
});

app.post("/addRecord/:email", haIniciado, function(request, response) 
{
    let email = request.params.email;
    
    if (Object.keys(request.body).length === 0) 
    {
        return response.status(400).send({ "message": "Datos del registro no proporcionados" });
    }
    if (!sistema.usuarios[email]) 
    {
        return response.status(404).send({ "message": "Usuario no encontrado" });
    }

    sistema.addRecord(request.body, email, function(result) 
    {
        if (result.Correcto) 
        {
            response.json({ "Correcto": true });
        } 
        else 
        {
            response.status(500).send({ "message": "Error al agregar el registro" });
        }
    });
});

app.get("/", function(request, response) 
{ 
});

app.get("/cierre", function(request, response)
{
    var contenido = fs.readFileSync(__dirname + "/app/servidor/cierre.html");
    response.setHeader("Content-type", "text/html");
    response.send(contenido);
});

app.get("/comprobarUsuario/:email", haIniciado, function(request, response) 
{
    let email = request.params.email;
    if (sistema.usuarios[email]) 
    {
        response.send({ "email": email });
    } 
    else 
    {
        response.status(400).send({ "email": -1, "message": "Usuario no se encuentra" });
    }
});

app.get("/obtenerUsuario/:email", haIniciado, function(request, response) 
{
    let email = request.params.email;

    if (!email || email.trim() === "") 
    {
        response.status(400).send({ "message": "Datos no proporcionados" });
    }
        
    console.log('Obteniendo usuario: ' + email);
    sistema.obtenerUsuario({ "email": email }, function(lista) 
    {
        if (lista.usr == -1)
        {
            response.status(404).send({ "message": "Usuario no encontrado" });
        }
        else
            response.send(lista);
    })
});

app.put("/actualizarUsuario/:email", haIniciado, function(request, response) 
{
    if (Object.keys(request.body).length === 0) 
    {
        return response.status(400).send({ "message": "Datos de la actualización no proporcionados" });
    }

    let email = request.params.email;
    let userProfile = request.body;

    if (!email || email.trim() === "") 
    {
        response.status(400).send({ "message": "Email no proporcionado" });
    } 

    sistema.actualizarUsuario(email, userProfile, function(res) 
    {
        if (res.email !== -1)
            response.json({ "Correcto": true });
        else
            response.status(404).json({ "message": "Usuario no encontrado" });
    });
});

app.get("/confirmarUsuario/:email/:key", function(request, response) 
{
    let email = request.params.email;
    let key = request.params.key;

    if (!email || email.trim() === "" || !key || key.trim() === "") 
    {
        response.status(400).send({ "message": "Datos no proporcionados" });
    }
    
    sistema.confirmarUsuario({ "email": email, "key": key }, function(usr) 
    {
        if (usr.email == -1)
        {
            response.status(400).send({ "message": "Ha sucedido un error" });
        }
        else
            response.redirect('/cierre');
    })
})

app.get("/cerrarSesion/:email", haIniciado, function(request, response) 
{
    let email = request.params.email;
    if (!email || email.trim() === "") 
    {
        response.status(400).send({ "message": "Email no proporcionado" });
    } 
    else 
    {
        let resultado = sistema.eliminarUsuario(email);
        if (resultado.email !== -1) 
        {
            response.send({ "message": "Sesión cerrada correctamente" });
        } 
        else 
        {
            response.status(404).send({ "message": "Usuario no encontrado" });
        }
    }
});

httpServer.listen(PORT, () => {
    console.log(`La aplicación se encuentra en el puerto: ${PORT}`);
    console.log('Ctrl+C para terminar ejecución');
});

io.listen(httpServer);
