
'use server';

import fs from 'fs';
import path from 'path';

export async function getApiRoutes(): Promise<string[]> {
  const apiDirectory = path.join(process.cwd(), 'src/app/api');
  
  function scanRoutes(dir: string, basePath: string = '/api'): string[] {
    let routes: string[] = [];
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        routes = routes.concat(scanRoutes(fullPath, `${basePath}/${file}`));
      } else if (file.endsWith('.ts') || file.endsWith('.js')) {
        const route = file.startsWith('route.') ? basePath : `${basePath}/${file.replace(/\.(js|ts)$/, '')}`;
        routes.push(route);
      }
    });
    
    return routes;
  }
  
  return scanRoutes(apiDirectory);
}
const page = async() => {
  const routes = await getApiRoutes();
  return (
    <div className='w-full h-screen flex flex-col items-center justify-center'>
      <p>API ROUTEs</p>
      {routes.map((route)=>{
        return(
          <p key={route}>{route}</p>
        )
      })}
    </div>
  )
}

export default page