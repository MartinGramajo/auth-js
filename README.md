## Auth.js -

El objetivo de esta sección es la autenticación de los usuarios, trabajaremos con Auth.js para tener la base de autenticación inicial y luego la ajustaremos a necesidades personalizadas

Puntos que vamos a trabajar:

1. Auth.js

2. Proveedores (google - github)

3. Credenciales personalizadas

4. Encriptar contraseña

5. Relaciones de bases de datos

6. Sesión de usuario

7. Server y Client side validation

8. Campos adicionales de usuario

9. Modificación global de usuario de Auth.js

La finalidad es poder controlar la sesión y poder tener identificados los usuarios de nuestra aplicación y dashboard administrativo.

# Development

Pasos para levantar la app en desarrollo

1. Levantar la base de datos. Esto con el docker abierto en nuestra PC.

```
docker compose up -d
```

2. Crear una copia de el .env.template, y renombrarlo a .env
3. Reemplazar las variables de entorno.
4. Ejecutar el comando `npm install`
5. Ejecutar el comando `npm run dev`
6. Ejecutar estos comando de prisma: Estos comando los ejecutamos porque la base al estar totalmente limpia no se ejecutaron los comando de migración ni el de generación del cliente (no hay regeneración del cliente ni tenemos ese schema en sintonía con nuestra base de datos).

```
npx prisma migrate dev
npx prisma generate
```

7. Ejecutar el SEED (esto es para reconstruir la base de datos local ) para [crear la base de datos local](http://localhost:3000/api/seed)

# Prisma commands

```
npx prisma init
npx prisma migrate dev
npx prisma generate
```

# Prod

# Stage

## Auth.js - Configuration iniciales

1. Comando de instalación : `npm install next-auth `
   Nota: el comando estaba requiriendo una instalación legacy o force.

[Documentación para Auth.js - Authentication for the web](https://next-auth.js.org/getting-started/example)

2. Crear carpeta de configuraciones: Lo haremos en la siguiente ruta: api/auth/[...nextauth]/route.ts
   Lo hacemos de esta forma, debido a que nuestras rutas se maneja con esa estructura.

NOTA: [...nextauth] esta sintaxis es un comodín, para decirle que cualquier ruta sea manejada por next auth.

3. En route.ts vamos a pegar lo siguiente y tenemos que hacer configuraciones:

```js
import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    // ...add more providers here
  ],
};
export default NextAuth(authOptions);
```

4. Configuraciones del archivo route.ts :

```js
import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";

// creamos esta const para definir nuestros providers
// ademas los creamos de esta forma para poder utilizar la referencia (authOptions) en otros lugares
export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
    // ...add more providers here
  ],
};

// con esto lo estamos segmentando
const handler = NextAuth(authOptions);

// Esto es para el manejo de peticiones GET Y POST por handler
// lo cual es necesario ya que NEXT ahora maneja los archivos de peticiones GET Y POST

export { handler as GET, handler as POST };
```

NOTA: esta linea `export { handler as GET, handler as POST };` equivale a esto:

```js
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: Request) {
  return NextResponse.json({
    hola: "mundo",
  });
}

export async function POST(request: Request) {
  return NextResponse.json({
    hola: "mundo",
    method: "POST",
  });
}
```

5. Probar que funciona: para ello vamos a bajar el proyecto y volver a levantarlo para que tome todas las nuevas referencias y nos iremos a la siguiente ruta: http://localhost:3000/api/auth/signin
   Si todo funciona correctamente tendríamos que ver lo siguiente:

![Configuración funciona correctamente](image.png)

NOTA: si tocamos el `Sign in with Github` nos tira error porque es lo que vamos a configurar. Por nos faltan nuestro clientID Y clientSecret.

6. Configuración de variables de entorno NEXTAUTH_SECRET="This is an example"

La cual tiene que estar generada de la siguiente forma `$ openssl rand -base64 32`
o con el siguiente [Link para generar el codigo](https://generate-secret.vercel.app/32)

NOTA: el código generado es siempre único. El código generado es el que vamos a reemplazar en la variable de entorno.

## Github Provider - Configurar Client ID y Client Secret

[Documentación para Auth.js - Providers](https://next-auth.js.org/providers/)

Para configurar necesitamos por un lado `el identificador de nuestra app` y `una llave secreta` que autoriza al backend poderse autenticar con esa aplicación.

```js
// identificador de la aplicación.
// Lo puede ver el usuario final.
// Esto viaja hacia el cliente.

GITHUB_ID=

// Llave secreta de la aplicación.
// No Lo puede ver el usuario final.
// Esto nunca sale de su servidor.

GITHUB_SECRET=
```

1. Como vamos a trabajar con las credenciales de github, nos iremos a [Github](https://github.com/settings/developers)

2. Abrimos nuestra cuenta, nos dirigimos a perfil/Settings/Developers Settings

3. En Developers Settings vamos a crear una => `OAUTH APPS`
   ![github](image-1.png)

4. Creamos uno nuevo llenando el siguiente formulario
   ![Form - OAUTH APPS](image-3.png)

NOTA: EL MAS IMPORTANTE DE LOS CAMPOS ES EL DE `Authorization callback URL`
Una vez que sucede la autenticación a donde lo queremos redireccionar, en nuestro caso, tenemos que editarlo como se muestra en la imagen: http://localhost:3000/api/auth/callback/:provider

Ademas es importante porque cuando tengamos nuestra app en production esa url va a cambiar.

> [NOTA]
>
> De esta misma forma haremos con todos los providers que queremos agregar a nuestra aplicación. Por ejemplo: google, Facebook, Spotify etc.

5. Una vez registrado el formulario, nos genera el `Client ID ` y `Client secrets` los cuales vamos a utilizar en nuestras variables de entorno.

6. Configuradas las variables de entornos le damos al botón de `Update application`.
   ![button](image-4.png)

7. Probamos las configuraciones, si todo sale correcto al darle al botón de login de github tendríamos que ver lo siguiente:

![login](image-5.png)

NOTA: si todo sale exitosamente, nos mandan a nuestro dashboard.

## Información del usuario - Server Side (DESDE EL LADO DEL SERVIDOR)

Tenemos 2 formas de saber cual es el usuario conectado:

- Desde el lado del servidor, se la utiliza para hacer la protección de ruta.

- Desde el lado del cliente, esto es mediante una petición de js saber cual es el usuario que esta conectado.

1.  Vamos a trabajar sobre page.ts de la carpeta Dashboard, esto es para hacer una protección granular

```js
import WidgetItem from "@/components/WidgetItem";

export const metadata = {
  title: "Dashboard main",
  description: "Dashboard main",
};

export default function DashboardPage() {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
      <WidgetItem title="Usuario conectado Server Side"></WidgetItem>
    </div>
  );
}
```

> [IMPORTANT]
>
> Si utilizamos lo que aprendimos en lugar de page.ts, lo utilizamos en layout.ts nos va a proteger todas las rutas comprendidas dentro de la carpeta Dashboard, es decir, nos protege: cart, cookies, products, rest-todos y server-todos.

2. Para tomar la información del usuario vamos a utilizar la función `getServerSession()` a la cual le pasaremos el `authOptions`

```js
import WidgetItem from "@/components/WidgetItem";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);


  return ();
}


```

3. Agregamos la validation de la ruta

```js
export default async function DashboardPage() {


  const session = await getServerSession(authOptions);

  // validation de ruta

  if(!session){
    redirect('/api/auth/signin')
  }

  return ()

```

4. Por ultimo tomamos los datos del usuario del `session.user`
   Nota: esto debe ser pasado por JSON.stringify().

```js
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
      <WidgetItem  title="Usuario conectado Server Side">
        {

          JSON.stringify( session.user)
        }
      </WidgetItem>
    </div>
  );
}
```

5. Le agregamos estilos

```js
<WidgetItem title="Usuario conectado Server Side">
  <div className=" flex flex-col">
    <span>{session.user?.name}</span>
    <span>{session.user?.image}</span>
    <span>{session.user?.email}</span>
  </div>
</WidgetItem>
```

## Tarea: Mostrar información del usuario

## Información del usuario - Client Side

Vamos a crear una nueva page para no mezclar con el Server Side.

1. Page.ts donde tenemos el profile del usuario

```js
"use client";

import { useEffect } from "react";

export default function ProfilePage() {
  useEffect(() => {
    console.log("Client Side");
  }, []);

  return (
    <div>
      <h1>Page Profile</h1>
    </div>
  );
}
```

2. Para obtener la información del usuario vamos a hacer uso de un hook `useSession()`

```js
"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function ProfilePage() {
  // en este caso vamos a tomar un hook useSession()

  const { data: session } = useSession();

  useEffect(() => {
    console.log("Client Side");
  }, []);

  return (
    <div>
      <h1>Page Profile</h1>
      <hr />
      <div className="flex flex-col">
        <span>{session?.user?.name ?? "No Name"}</span>
        <span>{session?.user?.email ?? "No Email"}</span>
        <span>{session?.user?.image ?? "No Image "}</span>
      </div>
    </div>
  );
}
```

3. Pero el useSession() debe estar envuelto en el `<SessionProvider />` el cual, es como cualquier otro un proveedor de data.
   Para ello vamos a crear una nueva carpeta con un nuevo archivo `AuthProvider.tsx`,en la siguiente ruta => src/auth/components/AuthProvider.tsx. Dicho componente `AuthProvider.tsx` el cual debe estar en la parte mas alta de nuestro árbol, es decir, en el `layout.tsx del DASHBOARD` pero como no podemos utilizar algo creado del cliente con algo creado del lado del servidor vamos a crear ese componente high order component (porque le vamos a enviar un children que seria toda nuestra app).

```js
"use client";

import { SessionProvider } from "next-auth/react";

interface Props {
  children: React.ReactNode;
}

const AuthProvider = ({ children, ...rest }: Props) => {
  return <SessionProvider>{children}</SessionProvider>;
};

export default AuthProvider;
```

4. Ahora, vamos a utilizar nuestro `AuthProvider.tsx` en el `layout.tsx del DASHBOARD`, en el cual tenemos que envolver toda la app con ese AuthProvider

```js
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import AuthProvider from "@/auth/components/AuthProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode,
}>) {
  return (
    <AuthProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    </AuthProvider>
  );
}
```
> [IMPORTANT]
>
> El hecho de que este envuelto toda nuestra aplicación con el authProvider no significa que transforma toda nuestra app en generada del lado del cliente, simplemente lo vemos como un contexto quedando como un híbrido. 