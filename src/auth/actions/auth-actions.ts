import prisma from "@/lib/prisma";
import bcrypt from 'bcryptjs';



export const signInEmailPassword = async ( email:string, password:string)=>{
    
    // validaciones si el email o pass no existen 
    if(!email ||!password) return null;

    // verificar si el usuario existe 
    const user = await prisma.user.findUnique({
        where: {
            email
        }
    });

    // si el usuario no existe, voy a crear el user 
    if(!user){
        const dbUser = await createUser(email, password);
        return dbUser;
    }

    // si el usuario existe, es decir, si hacen match retorno el user sino null
    if( !bcrypt.compareSync(password, user.password ?? '')){
        return null;
    }
    return user;
}

const createUser = async (email: string, password: string) => {

    const user = await prisma.user.create({
        data:{
            email: email,
            password: bcrypt.hashSync(password),  // para encriptar el password vamos a usar un paquete npm i bcryptjs de una sola via es decir que no se puede desencritar 
            name: email.split('@')[0],
        }
    })

    return user;
}