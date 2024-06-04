const datos = require("./cad.js");
const correo = require("./email.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require('fs');


function Sistema(test)
{
  this.usuarios={}; //this.usuarios=[]
  this.test = test
  this.cad = new datos.CAD();
  
  this.agregarUsuario = function(user, callback)
  {
    console.log("Agregando usuario");
    let res={"email":-1};

    if (!this.usuarios[user.email])
    {
      this.usuarios[user.email]=new Usuario(user.email);
      res.email=user.email;
      console.log("Nuevo usuario con email:" + user.email);
    }
    else 
    {
      console.log("el email "+user.email+" está en uso"); 
    }

    callback();
    return res;
  }

  this.usuarioGoogle = function(usr, callback)
  {
    let copia=usr;
    let modelo = this;
    let existe = false;

    this.cad.buscarUsuario({"email":usr.email}, function(usrAux) 
    {
      if (!usrAux) {
        modelo.cad.insertarUsuario(usr, function(res) {
          jwt.sign(usr, "token", (err, token) => {
            if (token) {
              usr.token = token;
              modelo.agregarUsuario(usr, () => callback(usr)); 
            }
          });
        });
      }
      else
      {
        jwt.sign(usr, "token", (err, token) => {
          if (token)
          {
            usr.token = token;
            modelo.agregarUsuario(usr, () => callback(usr)); 
          }
        } );
      }
    })


  }

  this.registrarUsuario = function(obj, callback)
  {
    let modelo=this;
    
    this.cad.buscarUsuario({"email":obj.email}, function(usr) {
      if (!usr) 
      {
        bcrypt.genSalt(10, (err, salt) => {
          if (err) 
          {
            console.log(err);
            callback(err);
          } 
          else 
          {
            bcrypt.hash(obj.password, salt, function(err, hash) {
              if (err) 
              {
                console.log(err);
                callback(err);
              } 
              else 
              {
                obj.password = hash;
                obj.key = Date.now().toString();
                obj.confirmada = false;

                modelo.cad.insertarUsuario(obj, function(res) {
                  callback(res);
                });
                if (!modelo.test)
                  correo.enviarEmail(obj.email, obj.key, "Confirmar cuenta");
              }
            });
          }
        });
      }
      else 
      {
        if (usr.confirmada)
          callback({ "email": -1 });
        else 
          callback({ "email": -2 });
      }
    });
  }

  this.loginUsuarioEmail = function(obj, callback)
  {
    let modelo = this;
    console.log(obj)

    this.cad.buscarUsuario({"email":obj.email, "confirmada":true}, function(usr)
    {
      if (usr) 
      {
        bcrypt.compare(obj.password, usr.password, function(err, result) 
        {
          if (err) 
          {
            console.log(err);
            callback({ "clave": -1 });
          } 
          else if (result) 
          {
            console.log("Usuario " + obj.email + " ha iniciado sesión");
            jwt.sign(obj, "token", (err, token) => {
              if (token)
              {
                usr.token = token;
                modelo.agregarUsuario(usr, () => callback(usr)); 
              }
            } );
            
          } 
          else 
          {
            callback({ "clave": -1 });
          }
        });
      } 
      else 
      {
        callback({ "clave": -1 });
      }
    })
  }

  this.loginUsuarioUsername = function(obj, callback)
  {
    let modelo = this;
    console.log(obj)
    this.cad.buscarUsuario({"username":obj.email, "confirmada":true}, function(usr)
    {
      if (usr) 
      {
        bcrypt.compare(obj.password, usr.password, function(err, result) 
        {
          if (err) 
          {
            console.log(err);
            callback({ "clave": -1 });
          } 
          else if (result) 
          {
            console.log("Usuario " + obj.email + " ha iniciado sesión");
            jwt.sign(obj, "token", (err, token) => {
              if (token)
              {
                usr.token = token;
                modelo.agregarUsuario(usr, () => callback(usr)); 
              }
            } );
            
          } 
          else 
          {
            callback({ "clave": -1 });
          }
        });
      } 
      else 
      {
        callback({ "clave": -1 });
      }
    })
  }

  this.addMarcador = function(obj, email, callback)
  {
    let modelo = this;
    this.cad.buscarUsuario({"email":email}, function(usr)
    {
      if (usr) 
      {
        usr.marcadores = usr.marcadores || [];
        usr.marcadores.push(obj);
        modelo.cad.actualizarUsuario(usr, function()
        {
          callback();
        })
      } 
      else 
      {
        callback({ "Correcto": false });
      }
    })
  }

  this.confirmarUsuario = function(obj, callback)
  {
    let modelo = this;
    this.cad.buscarUsuario({"email":obj.email, "confirmada":false, "key":obj.key}, function(usr)
    {
      if (usr)
      {
        usr.confirmada = true;
        modelo.cad.actualizarUsuario(usr, function(res)
        {
          callback({"email":res.email});
        })
      }
      else
      {
        callback({"email": -1});
      }
    })
  }

  this.obtenerUsuarios = function()
  {
    return this.usuarios;
  }

  this.obtenerUsuario = function(obj, callback)
  {
    let user;
    this.cad.buscarUsuario({"email":obj.email}, function(usr)
    {
      if (usr)
      {
          user = usr;
          callback(usr);
      }
      else
      {
        callback({"usr": -1});
      }
    })

    return user;
  }

  this.obtenerTodosNick = function()
  {
    return Object.keys(this.usuarios);
  }

  this.usuarioActivo = function(email)
  {
    let res={activo:false};
    res.activo=(email in this.usuarios);
    return res;
  }

  this.eliminarUsuario = function(email)
  {
    let res={"email":-1};

    if (this.usuarios[email])
    {
      res.nick=email;
      delete this.usuarios[email]
      console.log("Usuario con email: " + email + " borrado")
    }
    else 
    {
      console.log("El usuario no existe");
    }

    return res;
  }

  this.obtenerUsuariosDB = function(callback)
  {
      this.cad.buscarTodosUsuarios(function(lista)
      {
          callback(lista);
      })
  }

  this.obtenerLogs = function(callback)
  {
      this.cad.buscarLogs(function(lista)
      {
          callback(lista);
      })
  }

  this.numeroUsuarios = function()
  {
    let res = {"num": 0}

    if (Object.keys(this.usuarios)) 
    {
      res.num = Object.keys(this.usuarios).length
    }
    return res;
  }

    
  if (!this.test)
  {
    this.cad.conectar(function()
    {
      console.log('Conectado correctamente a Mongo Atlas');
    })
  }

  correo.conectar(function(res) 
  {
    console.log("Variables secretas obtenidas")
  });

}

function Usuario(email, clave)  //usr y luego usr.email usr.nick etc
{
  //this.nick=nick;
  this.email=email;
  this.clave=clave
}

module.exports.Sistema=Sistema;




   
   