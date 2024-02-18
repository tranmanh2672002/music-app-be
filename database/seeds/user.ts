import { SystemRole } from '../../src/modules/user/user.constant';
import env from 'dotenv';
import { hashPassword } from '../../src/common/helpers/commonFunctions';
env.config();
export const userData = {
    collectionName: 'users',
    data: [
        {
            deletedAt: null,
            deletedBy: null,
            updatedBy: null,
            email: 'manhtv@tokyotechlab.com',
            name: 'TTLab Admin',
            systemRole: SystemRole.ADMIN,
            password: hashPassword('Ab12345678'),
        },
    ],
};
