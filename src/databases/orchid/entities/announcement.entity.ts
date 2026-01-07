import { BigIntType, BlobType, DecimalType, Entity, JsonType, ManyToOne, Property, TextType } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { Account } from './account.entity';

interface IArgs {
    channel: Buffer,
    message: string | null,
    account: Account,
    replies: boolean
}

@Entity()
export class Announcement extends BaseEntity {
    @Property({ type: BlobType })
    channel!: Buffer;

    @Property({ nullable: true })
    message: string | null = null;

    @Property()
    replies!: boolean;

    @ManyToOne(() => Account)
    account!: Account;

    constructor(args: IArgs) {
        super();
        this.channel = args.channel;
        this.message = args.message;
        this.account = args.account;
        this.replies = args.replies;
    }
}
