import { PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';

export class BaseEntity {
    @PrimaryKey({ type: 'uuid' })
    uuid: string = v4();
    
    @Property()
    createdAt = new Date().toISOString();

    @Property({ onUpdate: () => new Date() })
    updatedAt = new Date().toISOString();
}
