import { Collection, Entity, OneToMany, Property } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { DID } from 'src/base/types/TDID';
import { Announcement } from './announcement.entity';

interface IArgs {
    did: DID,
    handle: string,
}

@Entity()
export class Account extends BaseEntity {
    @Property()
    did!: DID;

    @Property()
    handle!: string;

    @OneToMany({ entity: () => Announcement, mappedBy: 'account', orphanRemoval: true })
    announcements = new Collection<Announcement>(this);

    constructor(args: IArgs) {
        super();
        this.did = DID(args.did);
        this.handle = args.handle;
    }
}
