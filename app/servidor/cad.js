var mongo = require("mongodb").MongoClient;
var ObjectId = require("mongodb").ObjectId;

function CAD()
{
    this.usuarios;

    this.buscarOCrearUsuario = function(usr, callback)
    {
        buscarOCrear(this.usuarios, usr, callback);
    }

    function buscarOCrear(coleccion, criterio, callback)
    {
        coleccion.findOneAndUpdate(criterio, {$set: criterio}, {upsert: true,returnDocument:"after",projection:{email:1}}, function(err,doc) {
           if (err) { throw err; }
           else { 
                console.log("Elemento actualizado"); 
                console.log(doc.value.email);
                callback({email:doc.value.email});
            }
         });  
    }

    this.buscarTodosUsuarios = function(coleccion, callback) 
    {
        this.buscarTodosUsuarios(this.usuarios, callback);
    };

    this.buscarUsuario = function(obj, callback)
    {
        buscar(this.usuarios, obj, callback);
    }

    this.insertarUsuario = function(usuario, callback)
    {
        insertar(this.usuarios, usuario, callback);
    }

    this.insertarLog = function(log, callback)
    {
        insertar(this.logs, log, callback);
    }

    function buscar(coleccion, criterio, callback)
    {
        let col=coleccion;
        coleccion.find(criterio).toArray(function(error, usuarios)
        {
            if (usuarios.length==0)
            {
                callback(undefined);
            }
            else
            {
                callback(usuarios[0]);
            }
        });
    }

    function insertar(coleccion, elemento, callback)
    {
        coleccion.insertOne(elemento, function(err, result)
        {
            if(err)
            {
                console.log("error");
            }
            else
            {
                console.log("Nuevo elemento creado");
                callback(elemento);
            }
        });
    }

    this.actualizarUsuario = function(obj, callback)
    {
        actualizar(this.usuarios, obj, callback);
    }

    function actualizar(coleccion, obj, callback)
    {
        coleccion.findOneAndUpdate({_id:ObjectId(obj._id)}, {$set: obj}, {upsert: false,returnDocument:"after",projection:{email:1}}, function(err,doc) {
            if (err) 
            { 
                throw err; 
            }
            else 
            { 
                 console.log("Elemento actualizado"); 
                 callback({email:doc.value.email});
             }
          });   
    }

    this.eliminarUsuario=function(criterio,callback)
    {
        eliminar(this.usuarios,criterio,callback);
    }
 
    function eliminar(coleccion,criterio,callback)
    {
        coleccion.deleteOne(criterio,function(err,result)
        {
           if(err) throw err;             
           callback(result);
        });
    }

        
    this.conectar = async function(callback)
    {   
        let cad = this;
        let client = new mongo("mongodb+srv://adrirodlop25:kiJvWXD4GLKIYQ01@usuarios-fpa.9sis5tc.mongodb.net/?retryWrites=true&w=majority&appName=Usuarios-FPA");
        await client.connect();
        const database = client.db("sistema");
        cad.usuarios = database.collection("usuarios");
        callback(database);
    }
        

}

module.exports.CAD=CAD;