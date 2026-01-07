import { defineConfig } from "@mikro-orm/better-sqlite";
import { Migrator } from '@mikro-orm/migrations';

// no need to specify the `driver` now, it will be inferred automatically
export default defineConfig({
    name: "Orchid V2",
    dbName: 'src/databases/orchid-v2.db',
    entities: ['build/src/databases/orchid/entities/**/*.js'],
    entitiesTs: ['src/databases/orchid/entities/**/*.ts'],
    extensions: [Migrator],
    migrations: {
        path: 'build/src/databases/orchid/migrations',
        pathTs: 'src/databases/orchid/migrations',
        tableName: 'mikro_orm_migrations',
        transactional: true,
        allOrNothing: true,
        emit: 'ts',
    },

    debug: false,
});
