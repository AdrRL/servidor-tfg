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

const haIniciado = function(request,response,next)
{
    let token = request.headers.authorization.split(' ')[1];

    if (token)
    {
        jwt.verify(token, "token", (err, decoded) => {
            if (decoded)
            {
                next();
            }
            else
            {
                response.redirect("/")
            }
        });
    }
}

app.use(cors({
    origin:"http://localhost:4200",
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials:true,
    optionsSuccessStatus: 204,
}))

let test=false; 
test=eval(args[0]); //test=true test=false

app.use(express.static(__dirname + "/"));
app.use(cookieSession({
    name: 'TFG',
    keys: ['key1', 'key2']
}));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

let sistema = new modelo.Sistema(test);

app.get("/good", function(request, response)
{
    let email=request.user.emails[0].value;
    sistema.usuarioGoogle({"email": email}, function(usr)
    {
        response.cookie('email',usr.email);
        response.redirect('/');
    });
});
app.get("/fallo",function(request, response)
{
    response.send({email:"nook"})
});

app.post("/registrarUsuario",function(request, response)
{
    sistema.registrarUsuario(request.body,function(res)
    {
        response.json({"email":res.email});
    });
});

app.post("/agregarGoogleUser", function(request, response)
{
    sistema.usuarioGoogle(request.body,function(res)
    {
        response.json({"email": res.email, "token":res.token});
    });
});

app.post("/agregarOpenAIUser", function(request, response)
{
    sistema.usuarioOpenAI(request.body,function(res)
    {
        response.json({"email": res.email, "token":res.token});
    });
});


app.post("/loginUsuario",function(request,response)
{
    sistema.loginUsuarioEmail(request.body, function(res1)
    {
        if (res1.clave != -1)
        {
            response.json({"clave":res1.email, "token":res1.token});
        }
        else
            sistema.loginUsuarioUsername(request.body, function(res2)
            {
                response.json({"clave":res2.email, "token":res2.token});                
            });
    });
});

app.post("/addRecord/:email", haIniciado, function(request,response)
{
    let email=request.params.email;
    sistema.addRecord(request.body, email, function()
    {
        response.json({"Correcto": true});
    });
});



app.get("/", function(request,response)
{
    
});

app.get("/cierre", function(request, response)
{
    var contenido = fs.readFileSync(__dirname+"/app/servidor/cierre.html");
    response.setHeader("Content-type","text/html");
    response.send(contenido);
});

app.get("/eliminarUsuario/:email", haIniciado, function(request,response)
{
    let email=request.params.email;
    let res=sistema.eliminarUsuario(email);
    response.send(res);
});

app.get("/comprobarUsuario/:email", haIniciado, function(request,response)
{
    let email=request.params.email;

    if (sistema.usuarios[email])
    {
      response.send({"email": email});
    }
    else
    {
      response.send({"email": -1});
    }
  })

app.get("/obtenerUsuario/:email", haIniciado, function(request, response)
{
    let email = request.params.email;
    console.log(email);
    sistema.obtenerUsuario({"email": email}, function(lista)
    {
        response.send(lista);
    })
});  

app.put("/actualizarUsuario/:email", haIniciado, function(request, response) 
{
    let email = request.params.email;
    let userProfile = request.body;

    sistema.actualizarUsuario(email, userProfile, function(res) 
    {
        if (res.email !== -1) 
            response.json({"Correcto": true});
        else 
            response.status(400).json({"Correcto": false});
    });
});

app.get("/confirmarUsuario/:email/:key", function(request, response)
{
    let email = request.params.email;
    let key = request.params.key;
    console.log({"email":email,"key":key})
    sistema.confirmarUsuario({"email":email, "key":key}, function(usr)
    {
        if(usr.email!=-1)  
            response.cookie('email', usr.email);
        response.redirect('/cierre');
    })
})

app.post('/enviarJwt', function(request, response)
{
    let jwt=request.body.jwt;
    let user=JSON.parse(atob(jwt.split(".")[1]));
    let email=user.email;
    sistema.usuarioGoogle({"email":email}, function(obj)
    {
        response.send({'email':obj.email});
    })
});

app.get("/cerrarSesion/:email", haIniciado, function(request,response)
{
    let email=request.params.email;
    console.log(email)
    if (email)
    {
        sistema.eliminarUsuario(email);
    }
});



httpServer.listen(PORT, () => {
    console.log(`La aplicación se encuentra en el puerto: ${PORT}`);
    console.log('Ctrl+C para terminar ejecucción');
});

io.listen(httpServer);

    