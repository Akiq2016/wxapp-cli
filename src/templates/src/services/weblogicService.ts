import { weblogicApi } from '@/config/reqConf';
import { HttpService } from '@/services/httpService';
import t from '@/utils/tools';

// tslint:disable-next-line:max-classes-per-file
export class WebLogicService extends HttpService {
    constructor(moduleName: string) {
        super('/weblogic');
        const self: any = this;

        if (!weblogicApi.hasOwnProperty(moduleName)) {
            console.error('moduleName is not found please add it in file config/weblogicApi');
            return;
        }

        const apis = weblogicApi[moduleName];
        for (const k of Object.keys(apis)) {
            const item = apis[k];
            self[k] = async (req = {}): Promise<any> => {
                const config = t.deepClone(item);
                return self[item.type](req, config);
            };
        }
    }
}
