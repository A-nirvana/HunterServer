import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
//PrismaClient({log:['info','query','error']})

async function main(email:string,username:string,displayname:string,avatar:string) {
  await prisma.user.create({
    data:{
        email,
        username,
        displayname,
        avatar 
    }
  })
}

const CreateUser = async (req: Request, res: Response) => {
    const {email,username,displayname,avatar} = req.body
    main(email,username,displayname,avatar)
    .then(async () => {
      await prisma.$disconnect()
    })
    .catch(async (e) => {
      console.error(e)
      await prisma.$disconnect()
      process.exit(1)
    }).finally(() => {
    res.json({message: "Created successfully"})
    })
    };

export { CreateUser };