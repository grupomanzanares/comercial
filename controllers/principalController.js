
const admin = async(req, res) =>{
    res.render('proyect/principal',{
        page: 'Aqui va la pagina de Administracion del usuario que se logueo',
        csrfToken : req.csrfToken()
    })
}





export {
    admin
}