import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, getDocs, query, where } from '@angular/fire/firestore';
import { IUser } from '../interfaces/user.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private firestore = inject(Firestore);

  AddData(colection: string, data : any) {
    let col = collection(this.firestore, colection);
    addDoc(col, data);
  }

  async obtenerInfoUsuario(uid:string) : Promise<IUser | null>
  {
    try
    {
      let col = collection(this.firestore, 'users');
      const consulta = query(col, where("uid", "==", uid));
      const consultaEjecuto = await getDocs(consulta);

      if(consultaEjecuto.docs.length > 0)
      {
        console.log(consultaEjecuto.docs[0].data());
        return consultaEjecuto.docs[0].data() as any;
      }

      return null;
    }
    catch(error:any)
    {
      return null;
    }
  }

  async getUsersByRole(role : string) : Promise<IUser[]>
  {
    try
    {
      const users: IUser[] = []
      let col = collection(this.firestore, 'users');
      const consulta = query(col, where("role", "==", role));
      const consultaEjecuto = await getDocs(consulta);

      for (let doc of consultaEjecuto.docs )
      {
        users.push(doc.data() as any);
      }

      return users;
    }
    catch(err)
    {
      return [];
    }
  }
}
