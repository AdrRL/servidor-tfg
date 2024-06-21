// const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
// const client = new SecretManagerServiceClient();

// async function accessClaveCorreo()
// {
//   const name = 'projects/35221148320/secrets/CLAVECORREO/versions/1';
//     const [version] = await client.accessSecretVersion({
//       name: name,
//     });
//     const datos=version.payload.data.toString("utf8");

//     return datos;
// }

// async function accessCorreo()
// {
//   const name = 'projects/35221148320/secrets/CORREO/versions/1';
//     const [version] = await client.accessSecretVersion({
//       name: name,
//     });
//     const datos=version.payload.data.toString("utf8");

//     return datos;
// }

// module.exports.obtenerOptions = async function(callback)
// {
//   let options = {user:"", pass:""};
//   let pass = await accessClaveCorreo();
//   let user = await accessCorreo();

//   options.user = user;
//   options.pass = pass;

//   callback(options);
// }