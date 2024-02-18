import _ from 'lodash';
import { SystemRole } from '../user/user.constant';

export function parseToCamelCase(data) {
    data = _.mapKeys(data, (value, key) => _.camelCase(key));
    return data;
}

export const isSystemAdmin = (systemRole: SystemRole) => {
    return systemRole === SystemRole.ADMIN;
};
