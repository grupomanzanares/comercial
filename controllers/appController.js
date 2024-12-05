


const home = async(req, res) =>{
    res.render('home',{
        page: 'H O  M E',
        csrfToken : req.csrfToken()
    })
}

const nofFound = async(req, res) =>{
    res.render('404',{
        page: 'Oops No encontrado',
        csrfToken : req.csrfToken()
    })
}

const search = async(req, res) =>{
    res.render('404',{
        page: 'Oops No encontrado',
        csrfToken : req.csrfToken()
    })
}




export {
    home,
    nofFound,
    search
}