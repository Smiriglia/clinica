import { Injectable, inject } from '@angular/core';
import { Firestore, collection, getDocs, query, where } from '@angular/fire/firestore';
import { IUser } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private firestore = inject(Firestore);

  async obtenerUsuarioEmail(email : string) : Promise<IUser | null> {
    return this.ObtenerUsuario('email', email);
  }
  
  async obtenerInfoUsuario(uid:string) : Promise<IUser | null>
  {
    return this.ObtenerUsuario('uid', uid);
  }

  async obtenerUsuarioDni(dni : string) : Promise<IUser | null> {
    return this.ObtenerUsuario('dni', dni);
  }

  async ObtenerUsuario(key: string, value: any) : Promise<IUser | null> {
    try
    {
      let col = collection(this.firestore, 'users');
      const consulta = query(col, where(key, "==", value));
      const consultaEjecuto = await getDocs(consulta);

      if(consultaEjecuto.size > 0) {
        return consultaEjecuto.docs[0].data() as IUser;
      } 
      return null;
    }
    catch(error:any)
    {
      return null;
    }
  }
  
}
