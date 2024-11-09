import prisma from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcryptjs'
import { signInEmailPassword } from "@/auth/actions/auth-actions";

// si la migration se hizo perfectamente tendriamos que tener la opciones de user, session y todos los demas en prisma.

// creamos esta const para definir nuestros providers
// ademas los creamos de esta forma para poder utilizar la referencia (authOptions) en otros lugares
export const authOptions: NextAuthOptions = {
  // configuración del adaptador =>
  // adapter: PrismaAdapter que lo traemos de next-auth.
  // Prisma Adapter: tenemos que enviarle el object de prisma.

  adapter: PrismaAdapter(prisma),

  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
    // ...add more providers here
    CredentialsProvider({
      // nombre del provider
      name: "Credentials",
      // credentials => nos crea unos campos visuales en html 
      credentials: {
        email: {
          label: "Correo electronico",
          type: "email",
          placeholder: "usuario@gmail.com",
        },
        password: {
          label: "Contraseña",
          type: "password",
          placeholder: "*******",
        },
      },
      // method async el cual debe retornar un user o null
      async authorize(credentials, req) {
        // Agregamos la lógica para verificar el user en la base de datos y lo retornamos 
        const user =  await signInEmailPassword(credentials!.email, credentials!.password)

        if (user) {
          // Si retornar el user esta autenticado y procede con el ciclo de creación del jwt y la session.
          return user;
        } 
          // Si retorna null no esta autenticado 
          return null;
      
      },
    }),
  ],

  // modificaciones para manejar la data del user

  // agregamos el session
  session: {
    strategy: "jwt",
  },

  // los callbacks
  callbacks: {
    async signIn({ user, account, credentials, email, profile }) {
      console.log(user);

      return true; // si retornamos un false estamos negando la autenticación
    },

    // jwt
    // la idea es tener la info que yo quiero que se pase a la session
    // IMPORTANTE : se debe respetar el orden primero el jwt() esto es para enviar información y después la session que va a recibir la información
    async jwt({ token, user, account, profile }) {
      // console.log({token});

      // esto es para encontrar el usuario en la base de datos y que la información que vamos a enviar en la session sea la misma que tenemos en la base de datos
      const dbUser = await prisma.user.findUnique({
        where: { email: token.email ?? "no-email" },
      });

      // validation para en caso de que el usuario no este activo
      if (dbUser?.isActive === false) {
        throw new Error("User is not active");
      }

      // con esto enviamos la info del rol y el id para la session (para visualizarla por pantalla)
      token.roles = dbUser?.roles ?? ["no-roles"];
      token.id = dbUser?.id ?? "no-uuid";

      return token;
    },

    // cuando hacemos la session
    // lo importante de la session es enviar la session pero modificada con la información recibida por el jwt.
    async session({ session, token, user }) {
      // ahora vamos a modificar la session para tener los datos que le pasa jwt
      // la idea es reemplazar los datos que ya tiene la session por los que se le envía por token.
      if (session && session.user) {
        session.user.roles = token.roles;
        session.user.id = token.id;
      }

      return session;
    },
  },
};

// con esto lo estamos segmentando
const handler = NextAuth(authOptions);

// Esto es para el manejo de peticiones GET Y POST por handler
// lo cual es necesario ya que NEXT ahora maneja los archivos de peticiones GET Y POST

export { handler as GET, handler as POST };
