import {getStore} from '@netlify/blobs';
import catalog from '../../public/catalog.json' with {type:'json'};
import {createManagementHandler} from '../../server/management.mjs';
export default createManagementHandler({getStore:()=>getStore({name:'tamni-private-management',consistency:'strong'}),catalog});
