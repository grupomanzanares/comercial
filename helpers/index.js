const isSeller = (userId, propertyUserId) =>{
    return userId === propertyUserId
}

const formateDate = fecha =>{
    const newDate = new Date(fecha).toISOString().slice(0, 10)
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }
    return new Date(newDate).toLocaleDateString('es-ES', options)
}

export{
    isSeller,
    formateDate
}