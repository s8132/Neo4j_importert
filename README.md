# Neo4j importer

Import csv to neo4j

## Enable & create auto index in neo4j

### 1. neo4j.properties enable auto index

```
node_auto_indexing=true
node_keys_indexable=name,age
relationship_auto_indexing=true
relationship_keys_indexable=name,age
```

### 2. Create auto index in Neo4jShell

```
index --create node_auto_index -t Node
```

### check indexes in db:

```
index --indexes
```

*Based on https://github.com/talss89/angular-desktop-app*