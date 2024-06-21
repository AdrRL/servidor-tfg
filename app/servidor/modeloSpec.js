const modelo = require("./modelo.js");

describe('El sistema', function() 
{
  let sistema;

  beforeEach(function() 
  {
    sistema = new modelo.Sistema(true);
    usr={"nick":"Pepe", "email":"pepe@pepe.es"};
  });

  it('inicialmente no hay usuarios', function() 
  {
    expect(sistema.numeroUsuarios().num).toEqual(0);
  });

  it('se ha creado correctamente', function() 
  {
    sistema.agregarUsuario("Juan");
    expect(sistema.numeroUsuarios().num).toEqual(1);
  });

  it('se ha borrado creado correctamente', function() 
  {
    sistema.agregarUsuario("Juan");
    sistema.eliminarUsuario("Juan");
    expect(sistema.numeroUsuarios().num).toEqual(0);
  });

  it('se ha activado correctamente', function() 
  {
    sistema.agregarUsuario("Juan");
    expect(sistema.usuarioActivo("Juan").activo).toEqual(true);  // toEqual(true);
  });

  it('devuelve los usuarios correctamente', function() 
  {

    let usuarios = sistema.obtenerUsuarios();
    expect(Object.keys(usuarios).length).toEqual(0);
    sistema.agregarUsuario("Juan");
    sistema.agregarUsuario("Pedro");
    usuarios = sistema.obtenerUsuarios();
    expect(Object.keys(usuarios).length).toEqual(2);
  });

  it('logea correctamente', function() 
  {
    let usuarios = sistema.obtenerUsuarios();
    expect(Object.keys(usuarios).length).toEqual(0);
    
  });

  it('registra correctamente', function() 
  {
    let usuarios = sistema.obtenerUsuarios();
    expect(Object.keys(usuarios).length).toEqual(0);
    
  });

  /**
   * 
   */

  describe("Métodos que acceden a datos", function(){

    let usrTest={"email":"test@test.es", "password":"test", "nick":"test"};

    beforeEach(function(done){
      sistema.cad.conectar(function(){
        //sistema.registrarUsuario(usrTest, function(){
          //sistema.confirmarCuenta(usrTest.email, function(){
            done();
          //})
        //})
        //if (!modelo.test)
        //done();
      })
    })

    it("Inicio de sesión correcto", function(done){
      sistema.loginUsuario(usrTest, function(res){
        expect(res.email).toEqual(usrTest.email);
        expect(res.email).not.toEqual(-1);
        done();
      })
    })

    it("Inicio de sesión incorrecto", function(done){
      let usr1={"email":"test@test.es", "password":"test23", "nick":"test"};
      sistema.loginUsuario(usr1, function(res){
        expect(res.email).toEqual(-1);
        done();
      })
    })

    afterEach(function(){
      //Cerrar la conexión
    })

  })
})
