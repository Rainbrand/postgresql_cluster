import { ClusterFormModalValues } from '@features/cluster-secret-modal/model/types.ts';
import { CLUSTER_CREATION_TYPES, CLUSTER_FORM_FIELD_NAMES } from '@widgets/cluster-form/model/constants.ts';
import { INSTANCES_BLOCK_FIELD_NAMES } from '@entities/cluster/instances-block/model/const.ts';
import { STORAGE_BLOCK_FIELDS } from '@entities/cluster/storage-block/model/const.ts';
import { PROVIDER_CODE_TO_ANSIBLE_USER_MAP } from '@features/cluster-secret-modal/model/constants.ts';
import { SSH_KEY_BLOCK_FIELD_NAMES } from '@entities/cluster/ssh-key-block/model/const.ts';
import { LOAD_BALANCERS_FIELD_NAMES } from '@entities/cluster/load-balancers-block/model/const.ts';
import { AUTHENTICATION_METHODS, IS_EXPERT_MODE } from '@shared/model/constants.ts';
import {
  SECRET_MODAL_CONTENT_BODY_FORM_FIELDS,
  SECRET_MODAL_CONTENT_FORM_FIELD_NAMES,
} from '@entities/secret-form-block/model/constants.ts';
import { PROVIDERS } from '@shared/config/constants.ts';
import { INSTANCES_AMOUNT_BLOCK_VALUES } from '@entities/cluster/instances-amount-block/model/const.ts';
import { NETWORK_BLOCK_FIELD_NAMES } from '@entities/cluster/expert-mode/network-block/model/const.ts';
import { DCS_BLOCK_FIELD_NAMES, DCS_TYPES } from '@entities/cluster/expert-mode/dcs-block/model/const.ts';
import { DATA_DIRECTORY_FIELD_NAMES } from '@entities/cluster/expert-mode/data-directory-block/model/const.ts';
import { DATABASE_SERVERS_FIELD_NAMES } from '@entities/cluster/database-servers-block/model/const.ts';
import { EXTENSION_BLOCK_FIELD_NAMES } from '@entities/cluster/expert-mode/extensions-block/model/const.ts';
import { DATABASES_BLOCK_FIELD_NAMES } from '@entities/cluster/expert-mode/databases-block/model/const.ts';
import { CONNECTION_POOLS_BLOCK_FIELD_NAMES } from '@entities/cluster/expert-mode/connection-pools-block/model/const.ts';
import { ADDITIONAL_SETTINGS_BLOCK_FIELD_NAMES } from '@entities/cluster/expert-mode/additional-settings-block/model/const.ts';
import { BACKUP_METHODS, BACKUPS_BLOCK_FIELD_NAMES } from '@entities/cluster/expert-mode/backups-block/model/const.ts';
import { POSTGRES_PARAMETERS_FIELD_NAMES } from '@entities/cluster/expert-mode/postgres-parameters-block/model/const.ts';
import { KERNEL_PARAMETERS_FIELD_NAMES } from '@entities/cluster/expert-mode/kernel-parameters-block/model/const.ts';
import { RequestClusterCreate } from '@shared/api/api/clusters.ts';
import { isEmpty } from 'lodash';

/**
 * Converts a multiline string of parameters into an array of objects with `option` and `value` keys.
 *
 * Each line in the input string should contain a parameter in the format "option:value" or "option=value".
 * Lines are split by newline characters, and then each line is split at either ':' or '='.
 * Leading and trailing whitespaces for both `option` and `value` are trimmed.
 *
 * @param value - The multiline string representing the parameters.
 * @returns An array of objects with `option` and `value`, or the original value if empty.
 */
export const convertModalParametersToArray = (value?: string) =>
  value?.length
    ? value.split(/[\n\r]/).map((item) => {
        const values = item.split(/[:=]/);
        return {
          option: values?.[0].trim(),
          value: values?.[1].trim(),
        };
      })
    : value;

/**
 * Generates an object containing common extra variables required for cluster creation.
 *
 * This function extracts the PostgreSQL version and Patroni cluster name
 * from the provided form values to be used as shared environment variables
 * (extra_vars) in cluster creation requests.
 *
 * @param values - The form values containing cluster configuration.
 * @returns An object with common extra vars.
 */
export const getCommonExtraVars = (values: ClusterFormModalValues) => ({
  postgresql_version: values[CLUSTER_FORM_FIELD_NAMES.POSTGRES_VERSION],
  patroni_cluster_name: values[CLUSTER_FORM_FIELD_NAMES.CLUSTER_NAME],
});

/**
 * Generates cloud-specific extra variables for the cluster creation request.
 *
 * This function builds an object containing cloud provider related parameters
 * to be sent in the `extra_vars` field of the cluster creation request.
 * It supports both standard and expert modes, and may include fields such as
 * server type, location, instance amount, volume size/type, SSH keys, load balancer flags, and more,
 * depending on user input and form values.
 *
 * @param values - The filled form values from the cluster creation form.
 * @returns Object containing the extra variables for a cloud provider cluster.
 *
 * The returned object may contain the following keys:
 *   - postgresql_version: Major version of PostgreSQL selected.
 *   - patroni_cluster_name: The name of the cluster.
 *   - cloud_provider: The code of the selected cloud provider.
 *   - server_type: Type of server instance (custom or pre-defined).
 *   - server_location: Code of the region/datacenter where the cluster will be deployed.
 *   - server_count: Number of server instances to create.
 *   - volume_size: Persistent volume size.
 *   - ansible_user: Default Ansible user for provider.
 *   - ssh_public_keys: (optional) Array of SSH public keys formatted for Ansible.
 *   - (Cloud image fields): Flattened from selected cloud image (if present).
 * If expert mode is enabled, this may also include:
 *   - postgresql_data_dir_mount_fstype: File system type for PGDATA directory mount.
 *   - volume_type: Storage backend type.
 *   - database_public_access: Whether the DB will have a public connection.
 *   - cloud_load_balancer: Whether a cloud load balancer will be used.
 *   - server_spot: Will be true if using AWS/GCP/Azure with spot/preemptible instances enabled.
 *   - server_network: (optional) Provided if custom network is defined.
 */
export const getCloudProviderExtraVars = (values: ClusterFormModalValues) => ({
  ...getCommonExtraVars(values),
  cloud_provider: values[CLUSTER_FORM_FIELD_NAMES.PROVIDER].code,
  server_type:
    values?.[CLUSTER_FORM_FIELD_NAMES.INSTANCE_TYPE] === 'custom'
      ? values[INSTANCES_BLOCK_FIELD_NAMES.SERVER_TYPE]
      : values[CLUSTER_FORM_FIELD_NAMES.INSTANCE_CONFIG].code,
  server_location: values[CLUSTER_FORM_FIELD_NAMES.REGION_CONFIG].code,
  server_count: values[CLUSTER_FORM_FIELD_NAMES.INSTANCES_AMOUNT],
  volume_size: values[STORAGE_BLOCK_FIELDS.STORAGE_AMOUNT],
  ansible_user: PROVIDER_CODE_TO_ANSIBLE_USER_MAP[values[CLUSTER_FORM_FIELD_NAMES.PROVIDER].code],
  ...(values[SSH_KEY_BLOCK_FIELD_NAMES.SSH_PUBLIC_KEY]?.length
    ? { ssh_public_keys: values[SSH_KEY_BLOCK_FIELD_NAMES.SSH_PUBLIC_KEY].split(/[\n\r]/).map((key) => `'${key}'`) }
    : {}),
  ...values[CLUSTER_FORM_FIELD_NAMES.REGION_CONFIG].cloud_image.image,
  ...(IS_EXPERT_MODE
    ? {
        postgresql_data_dir_mount_fstype: values[STORAGE_BLOCK_FIELDS.FILE_SYSTEM_TYPE],
        volume_type: values[STORAGE_BLOCK_FIELDS.VOLUME_TYPE],
        database_public_access: !!values?.[ADDITIONAL_SETTINGS_BLOCK_FIELD_NAMES.IS_DB_PUBLIC_ACCESS],
        cloud_load_balancer: !!values?.[ADDITIONAL_SETTINGS_BLOCK_FIELD_NAMES.IS_CLOUD_LOAD_BALANCER],
        ...([PROVIDERS.AWS, PROVIDERS.GCP, PROVIDERS.AZURE].includes(values[CLUSTER_FORM_FIELD_NAMES.PROVIDER]?.code) &&
        !!values[INSTANCES_AMOUNT_BLOCK_VALUES.IS_SPOT_INSTANCES]
          ? {
              server_spot: true,
            }
          : {}),
        ...(values[NETWORK_BLOCK_FIELD_NAMES.SERVER_NETWORK]
          ? { server_network: values[NETWORK_BLOCK_FIELD_NAMES.SERVER_NETWORK] }
          : {}),
      }
    : {}),
});

/**
 * Creates an object with environment variables (extra_vars) exclusive to local machine clusters
 * for use in the cluster creation request.
 *
 * This function merges generic cluster variables as well as special local machine fields:
 * - Sets cluster virtual IP if provided.
 * - Enables HAProxy-based load balancing if selected.
 * - Marks an existing cluster if flagged.
 * - Adds ansible user and password if using password authentication (with no saved secret).
 * - Adds DCS configuration details and Postgres data directory when in expert mode.
 * - If not deploying a new DCS cluster, includes DCS connection data for etcd or consul.
 *
 * @param values - The filled form values from the cluster creation form.
 * @param secretId - Optional ID of secret if exists.
 * @returns The extra_vars object tailored for local machine cluster creation.
 */
export const getLocalMachineExtraVars = (values: ClusterFormModalValues, secretId?: number) => ({
  ...getCommonExtraVars(values),
  ...(values[CLUSTER_FORM_FIELD_NAMES.CLUSTER_VIP_ADDRESS]
    ? { cluster_vip: values[CLUSTER_FORM_FIELD_NAMES.CLUSTER_VIP_ADDRESS] }
    : {}),
  ...(values[LOAD_BALANCERS_FIELD_NAMES.IS_HAPROXY_ENABLED] ? { with_haproxy_load_balancing: true } : {}),
  ...(values[CLUSTER_FORM_FIELD_NAMES.IS_CLUSTER_EXISTS] ? { existing_cluster: true } : {}),
  ...(!secretId &&
  !values[CLUSTER_FORM_FIELD_NAMES.IS_USE_DEFINED_SECRET] &&
  values[CLUSTER_FORM_FIELD_NAMES.AUTHENTICATION_METHOD] === AUTHENTICATION_METHODS.PASSWORD
    ? {
        ansible_user: values[SECRET_MODAL_CONTENT_FORM_FIELD_NAMES.USERNAME],
        ansible_ssh_pass: values[SECRET_MODAL_CONTENT_FORM_FIELD_NAMES.PASSWORD],
      }
    : {}),
  ...(IS_EXPERT_MODE
    ? {
        dcs_type: values?.[DCS_BLOCK_FIELD_NAMES.TYPE],
        ...(!values[DCS_BLOCK_FIELD_NAMES.IS_DEPLOY_NEW_CLUSTER]
          ? {
              dcs_exists: true,
              ...(values[DCS_BLOCK_FIELD_NAMES.TYPE] === DCS_TYPES.ETCD
                ? {
                    patroni_etcd_hosts: values?.[DCS_BLOCK_FIELD_NAMES.DCS_DATABASES]?.map((database) => ({
                      host: database[DCS_BLOCK_FIELD_NAMES.DCS_DATABASE_IP_ADDRESS],
                      port: database[DCS_BLOCK_FIELD_NAMES.DCS_DATABASE_PORT],
                    })),
                  }
                : {
                    consul_join: values?.[DCS_BLOCK_FIELD_NAMES.DCS_DATABASES]?.map(
                      (database) => database[DCS_BLOCK_FIELD_NAMES.DCS_DATABASE_IP_ADDRESS],
                    ),
                    consul_ports_serf_lan: 8301,
                  }),
            }
          : {}),
        postgresql_data_dir: values?.[DATA_DIRECTORY_FIELD_NAMES.DATA_DIRECTORY],
      }
    : {}),
});

/**
 * Function maps server (either database or DCS) entries from form values into a key-value object
 * suitable for requests (e.g., Ansible inventory hosts).
 *
 * @param values - Filled form values.
 * @param role - Optional role for Consul instances.
 * @param shouldAddHostname - An optional flag determines if field 'hostname' should be added. False by default.
 * @param isDbServers - An optional flag determines which db servers are mapping - Database servers or DCS. True by default.
 * @returns Object with host address keys and configuration objects as values.
 */
const configureHosts = ({
  values,
  role,
  shouldAddHostname = false,
  isDbServers = true,
}: {
  values: ClusterFormModalValues;
  role?: string;
  shouldAddHostname?: boolean;
  isDbServers?: boolean;
}) => {
  const dbServersKeys = {
    servers: DATABASE_SERVERS_FIELD_NAMES.DATABASE_SERVERS,
    ipAddress: DATABASE_SERVERS_FIELD_NAMES.DATABASE_IP_ADDRESS,
  };

  const dcsHostsKeys = {
    servers: DCS_BLOCK_FIELD_NAMES.DCS_DATABASES,
    ipAddress: DCS_BLOCK_FIELD_NAMES.DCS_DATABASE_IP_ADDRESS,
    hostname: DCS_BLOCK_FIELD_NAMES.DCS_DATABASE_HOSTNAME,
  };

  const usedKeys = isDbServers ? dbServersKeys : dcsHostsKeys;

  return values[usedKeys.servers].reduce(
    (acc, server) => ({
      ...acc,
      [server[usedKeys.ipAddress]]: {
        ansible_host: server[usedKeys.ipAddress],
        ...(shouldAddHostname && usedKeys?.hostname ? { hostname: server[usedKeys.hostname] } : {}),
        ...(role ? { consul_node_role: role } : {}),
      },
    }),
    {},
  );
};

/**
 * Constructs the DCS (Distributed Configuration Store) environment object
 * for the cluster creation request based on the provided form values.
 *
 * Handles both expert and non-expert modes for DCS options (ETCD, CONSUL)
 * and adapts the structure depending on whether a new DCS cluster is being deployed,
 * what the DCS type is, and whether hosts should be configured as database servers or external.
 *
 * @param values - The filled cluster form values.
 * @returns An object with the correct DCS request payload, or undefined if not applicable.
 */
const constructDcsEnvs = (values: ClusterFormModalValues) => {
  if (values[DCS_BLOCK_FIELD_NAMES.IS_DEPLOY_NEW_CLUSTER]) {
    if (!IS_EXPERT_MODE) {
      // Non-expert mode, only ETCD with database servers
      return {
        etcd_cluster: {
          hosts: configureHosts({ values }),
        },
        consul_instances: { hosts: {} },
      };
    }
    if (IS_EXPERT_MODE) {
      // Expert mode, support both ETCD and CONSUL
      switch (values[DCS_BLOCK_FIELD_NAMES.TYPE]) {
        case DCS_TYPES.ETCD:
          // ETCD as DCS, may deploy to db servers or external
          return {
            etcd_cluster: {
              hosts: configureHosts({
                values,
                isDbServers: values[DCS_BLOCK_FIELD_NAMES.IS_DEPLOY_TO_DB_SERVERS],
                shouldAddHostname: !values[DCS_BLOCK_FIELD_NAMES.IS_DEPLOY_TO_DB_SERVERS],
              }),
            },
            consul_instances: { hosts: {} },
          };
        case DCS_TYPES.CONSUL:
          // CONSUL as DCS, can configure client/server hosts
          return {
            etcd_cluster: {
              hosts: {},
            },
            consul_instances: {
              hosts: values[DCS_BLOCK_FIELD_NAMES.IS_DEPLOY_TO_DB_SERVERS]
                ? configureHosts({ values, role: 'server' })
                : {
                    ...configureHosts({ values, role: 'client' }),
                    ...configureHosts({
                      values,
                      role: 'server',
                      isDbServers: false,
                      shouldAddHostname: true,
                    }),
                  },
            },
          };
        default:
          // When DCS type is unknown
          return {
            etcd_cluster: { hosts: {} },
            consul_instances: {
              hosts: {},
            },
          };
      }
    }
  }
  // For expert mode, not deploying new DCS cluster & DCS type is CONSUL
  if (IS_EXPERT_MODE && !values[DCS_BLOCK_FIELD_NAMES.IS_DEPLOY_NEW_CLUSTER]) {
    if (values[DCS_BLOCK_FIELD_NAMES.TYPE] === DCS_TYPES.CONSUL) {
      return {
        consul_instances: {
          hosts: configureHosts({ values, role: 'client' }),
        },
      };
    }
  }
};

/**
 * Constructs the load balancer environment object required for the
 * cluster inventory Ansible JSON based on form values.
 *
 * Depending on the HAProxy configuration and deployment mode,
 * this function will map appropriate server IP addresses to their
 * respective ansible_host properties for the balancer hosts.
 *
 * @param values - The filled form values from the cluster creation form.
 * @returns Object containing the `balancers.hosts` map for Ansible inventory.
 */
const constructBalancersEnvs = (values: ClusterFormModalValues) => {
  let balancerHosts = {};

  if (values[LOAD_BALANCERS_FIELD_NAMES.IS_HAPROXY_ENABLED]) {
    if (IS_EXPERT_MODE && !values[LOAD_BALANCERS_FIELD_NAMES.IS_DEPLOY_TO_DATABASE_SERVERS]) {
      // Advanced: use explicit load balancer database list
      balancerHosts = values[LOAD_BALANCERS_FIELD_NAMES.LOAD_BALANCER_DATABASES].reduce(
        (acc, server) => ({
          ...acc,
          [server[LOAD_BALANCERS_FIELD_NAMES.LOAD_BALANCER_DATABASES_IP_ADDRESS]]: {
            ansible_host: server[LOAD_BALANCERS_FIELD_NAMES.LOAD_BALANCER_DATABASES_IP_ADDRESS],
          },
        }),
        {},
      );
    } else {
      // Standard: use main database server list
      balancerHosts = values[DATABASE_SERVERS_FIELD_NAMES.DATABASE_SERVERS].reduce(
        (acc, server) => ({
          ...acc,
          [server[DATABASE_SERVERS_FIELD_NAMES.DATABASE_IP_ADDRESS]]: {
            ansible_host: server[DATABASE_SERVERS_FIELD_NAMES.DATABASE_IP_ADDRESS],
          },
        }),
        {},
      );
    }
  }

  return {
    balancers: {
      hosts: balancerHosts,
    },
  };
};

/**
 * Generates local machine environment variables object for Ansible inventory JSON.
 *
 * This function builds an environment object required for local cluster deployments.
 * It considers authentication method (SSH or Password), usage of pre-defined secrets,
 * and populates Ansible inventory settings for master and replica database servers,
 * balancers, and DCS environments. The output structure is compatible with Ansible.
 *
 * @param values - The filled form values from the cluster creation form.
 * @param secretId - Optional ID of secret if exists.
 * @returns Environment variables object, including SSH key if needed and ANSIBLE_INVENTORY_JSON.
 */
export const getLocalMachineEnvs = (values: ClusterFormModalValues, secretId?: number) => ({
  // If using SSH authentication and no pre-defined secret, include the SSH private key content.
  ...(values[CLUSTER_FORM_FIELD_NAMES.AUTHENTICATION_METHOD] === AUTHENTICATION_METHODS.SSH &&
  !values[CLUSTER_FORM_FIELD_NAMES.IS_USE_DEFINED_SECRET] &&
  !secretId
    ? {
        SSH_PRIVATE_KEY_CONTENT: values[SECRET_MODAL_CONTENT_FORM_FIELD_NAMES.SSH_PRIVATE_KEY],
      }
    : {}),
  ANSIBLE_INVENTORY_JSON: {
    all: {
      vars: {
        ansible_user: values[SECRET_MODAL_CONTENT_FORM_FIELD_NAMES.USERNAME],
        // For password-based authentication, include ssh_pass and sudo_pass.
        ...(values[CLUSTER_FORM_FIELD_NAMES.AUTHENTICATION_METHOD] === AUTHENTICATION_METHODS.PASSWORD
          ? {
              ansible_ssh_pass: values[SECRET_MODAL_CONTENT_FORM_FIELD_NAMES.USERNAME],
              ansible_sudo_pass: values[SECRET_MODAL_CONTENT_FORM_FIELD_NAMES.PASSWORD],
            }
          : {}),
      },
      children: {
        // Add balancers and DCS envs via helper functions.
        ...constructBalancersEnvs(values),
        ...constructDcsEnvs(values),
        // The 'master' host group: first database server is master.
        master: {
          hosts: {
            [values[DATABASE_SERVERS_FIELD_NAMES.DATABASE_SERVERS][0][
              DATABASE_SERVERS_FIELD_NAMES.DATABASE_IP_ADDRESS
            ]]: {
              hostname:
                values[DATABASE_SERVERS_FIELD_NAMES.DATABASE_SERVERS][0][
                  DATABASE_SERVERS_FIELD_NAMES.DATABASE_HOSTNAME
                ],
              ansible_host:
                values[DATABASE_SERVERS_FIELD_NAMES.DATABASE_SERVERS][0][
                  DATABASE_SERVERS_FIELD_NAMES.DATABASE_IP_ADDRESS
                ],
              server_location:
                values[DATABASE_SERVERS_FIELD_NAMES.DATABASE_SERVERS]?.[0]?.[
                  DATABASE_SERVERS_FIELD_NAMES.DATABASE_LOCATION
                ],
              postgresql_exists: IS_EXPERT_MODE
                ? values[DATABASE_SERVERS_FIELD_NAMES.DATABASE_SERVERS]?.[0]?.[
                    DATABASE_SERVERS_FIELD_NAMES.IS_POSTGRESQL_EXISTS
                  ]
                : (values[DATABASE_SERVERS_FIELD_NAMES.IS_CLUSTER_EXISTS] ?? false),
            },
          },
        },
        // The 'replica' host group: all other database servers (if present).
        ...(values[DATABASE_SERVERS_FIELD_NAMES.DATABASE_SERVERS].length > 1
          ? {
              replica: {
                hosts: values[DATABASE_SERVERS_FIELD_NAMES.DATABASE_SERVERS].slice(1).reduce(
                  (acc, server) => ({
                    ...acc,
                    [server[DATABASE_SERVERS_FIELD_NAMES.DATABASE_IP_ADDRESS]]: {
                      hostname: server?.[DATABASE_SERVERS_FIELD_NAMES.DATABASE_HOSTNAME],
                      ansible_host: server?.[DATABASE_SERVERS_FIELD_NAMES.DATABASE_IP_ADDRESS],
                      server_location: server?.[DATABASE_SERVERS_FIELD_NAMES.DATABASE_LOCATION],
                      postgresql_exists: IS_EXPERT_MODE
                        ? server?.[DATABASE_SERVERS_FIELD_NAMES.IS_POSTGRESQL_EXISTS]
                        : (values[DATABASE_SERVERS_FIELD_NAMES.IS_CLUSTER_EXISTS] ?? false),
                    },
                  }),
                  {},
                ),
              },
            }
          : {}),
        postgres_cluster: {
          children: {
            master: {},
            replica: {},
          },
        },
      },
    },
  },
});

/**
 * Function converts 'extensions' form value into request format.
 *
 * @param values - The form values containing extensions data
 * @returns An object with extensions in API-ready format and extraVars for third-party extensions
 */
const getExtensions = (values: ClusterFormModalValues) =>
  Object.entries(values?.[EXTENSION_BLOCK_FIELD_NAMES.EXTENSIONS])?.reduce(
    (acc, [key, value]) => {
      if (value?.db?.length) {
        const convertedToReqFormat = value.db.map((item) => ({
          ext: key,
          db: values[DATABASES_BLOCK_FIELD_NAMES.NAMES][item],
        }));
        const convertedToExtraVars = value?.isThirdParty // transform third party extensions in {enable_name: true} format.
          ? {
              ...acc.extraVars,
              [`enable_${key}`]: true,
            }
          : acc.extraVars;
        return { db: [...acc.db, ...convertedToReqFormat], extraVars: convertedToExtraVars };
      }
      return acc;
    },
    { db: [], extraVars: {} },
  ) ?? { db: [], extraVars: {} };

/**
 * Generates an object containing base cluster extra_vars shared between cloud and local clusters.
 *
 * This function constructs extra variables required for the creation of a cluster, using the form values provided.
 * If expert mode is enabled, additional configuration is included, such as databases, users, connection pool settings,
 * enabled extensions, backup configuration, PostgreSQL and kernel parameters, and synchronous standby settings.
 *
 * @param values - The filled form values for the cluster creation form.
 * @returns An object containing the encoded base extra_vars for the cluster.
 */
export const getBaseClusterExtraVars = (values: ClusterFormModalValues) => {
  const extensions = IS_EXPERT_MODE ? getExtensions(values) : [];

  const baseExtraVars = {
    environment_id: values[CLUSTER_FORM_FIELD_NAMES.ENVIRONMENT_ID],
    description: values[CLUSTER_FORM_FIELD_NAMES.DESCRIPTION],
  };

  return IS_EXPERT_MODE
    ? {
        ...baseExtraVars,
        postgresql_databases: values[DATABASES_BLOCK_FIELD_NAMES.DATABASES]?.map((db) => ({
          db: db?.[DATABASES_BLOCK_FIELD_NAMES.DATABASE_NAME],
          owner: db?.[DATABASES_BLOCK_FIELD_NAMES.USER_NAME],
          encoding: db?.[DATABASES_BLOCK_FIELD_NAMES.ENCODING],
          lc_ctype: db?.[DATABASES_BLOCK_FIELD_NAMES.LOCALE],
          lc_collate: db?.[DATABASES_BLOCK_FIELD_NAMES.LOCALE],
        })),
        postgresql_users: values[DATABASES_BLOCK_FIELD_NAMES.DATABASES]?.map((db) => ({
          name: db?.[DATABASES_BLOCK_FIELD_NAMES.USER_NAME],
          password: db?.[DATABASES_BLOCK_FIELD_NAMES.USER_PASSWORD],
        })),
        pgbouncer_install: !!values[CONNECTION_POOLS_BLOCK_FIELD_NAMES.IS_CONNECTION_POOLER_ENABLED],
        netdata_install: !!values?.[ADDITIONAL_SETTINGS_BLOCK_FIELD_NAMES.IS_NETDATA_MONITORING],
        ...(values[CONNECTION_POOLS_BLOCK_FIELD_NAMES.IS_CONNECTION_POOLER_ENABLED] // do not add pools info if connection pooler is disabled
          ? {
              pgbouncer_pools: values?.[CONNECTION_POOLS_BLOCK_FIELD_NAMES.POOLS]?.map((pool) => ({
                name: pool?.[CONNECTION_POOLS_BLOCK_FIELD_NAMES.POOL_NAME],
                dbname: pool?.[CONNECTION_POOLS_BLOCK_FIELD_NAMES.POOL_NAME],
                pool_parameters: {
                  pool_size: pool?.[CONNECTION_POOLS_BLOCK_FIELD_NAMES.POOL_SIZE],
                  pool_mode: pool?.[CONNECTION_POOLS_BLOCK_FIELD_NAMES.POOL_MODE],
                },
              })),
            }
          : {}),
        ...(extensions?.db?.length ? { postgresql_extensions: extensions?.db } : {}),
        ...extensions?.extraVars,
        ...(values?.[BACKUPS_BLOCK_FIELD_NAMES.IS_BACKUPS_ENABLED] && values?.[BACKUPS_BLOCK_FIELD_NAMES.BACKUP_METHOD]
          ? values[BACKUPS_BLOCK_FIELD_NAMES.BACKUP_METHOD] === BACKUP_METHODS.PG_BACK_REST
            ? {
                pgbackrest_install: true,
                pgbackrest_backup_hour: values?.[BACKUPS_BLOCK_FIELD_NAMES.BACKUP_START_TIME],
                pgbackrest_retention_full: values?.[BACKUPS_BLOCK_FIELD_NAMES.BACKUP_RETENTION],
                pgbackrest_retention_full_type: 'time',
                ...(values?.[BACKUPS_BLOCK_FIELD_NAMES.CONFIG]
                  ? {
                      pgbackrest_auto_conf: false,
                      pgbackrest_conf: {
                        global: convertModalParametersToArray(values?.[BACKUPS_BLOCK_FIELD_NAMES.CONFIG]),
                      },
                    }
                  : {}),
                ...([PROVIDERS.DIGITAL_OCEAN, PROVIDERS.HETZNER].includes(
                  values?.[CLUSTER_FORM_FIELD_NAMES.PROVIDER]?.code,
                )
                  ? {
                      pgbackrest_s3_key: values?.[BACKUPS_BLOCK_FIELD_NAMES.ACCESS_KEY],
                      pgbackrest_s3_key_secret: values?.[BACKUPS_BLOCK_FIELD_NAMES.SECRET_KEY],
                    }
                  : {}),
              }
            : {
                wal_g_install: true,
                wal_g_backup_hour: values?.[BACKUPS_BLOCK_FIELD_NAMES.BACKUP_START_TIME],
                wal_g_retention_full: values?.[BACKUPS_BLOCK_FIELD_NAMES.BACKUP_RETENTION],
                ...(values?.[BACKUPS_BLOCK_FIELD_NAMES.CONFIG]
                  ? {
                      wal_g_auto_conf: false,
                      wal_g_json: convertModalParametersToArray(values?.[BACKUPS_BLOCK_FIELD_NAMES.CONFIG]),
                    }
                  : {}),
                ...([PROVIDERS.DIGITAL_OCEAN, PROVIDERS.HETZNER].includes(
                  values?.[CLUSTER_FORM_FIELD_NAMES.PROVIDER]?.code,
                )
                  ? {
                      wal_g_aws_access_key_id: values?.[BACKUPS_BLOCK_FIELD_NAMES.ACCESS_KEY],
                      wal_g_aws_secret_access_key: values?.[BACKUPS_BLOCK_FIELD_NAMES.SECRET_KEY],
                    }
                  : {}),
              }
          : {
              // backups disabled explicitly
              pgbackrest_install: false,
              pgbackrest_auto_conf: false,
            }),
        ...(values?.[POSTGRES_PARAMETERS_FIELD_NAMES.POSTGRES_PARAMETERS]
          ? {
              local_postgresql_parameters: convertModalParametersToArray(
                values?.[POSTGRES_PARAMETERS_FIELD_NAMES.POSTGRES_PARAMETERS],
              ),
            }
          : {}),
        ...(values?.[KERNEL_PARAMETERS_FIELD_NAMES.KERNEL_PARAMETERS]
          ? {
              sysctl_set: true,
              sysctl_conf: {
                postgres_cluster: convertModalParametersToArray(
                  values?.[KERNEL_PARAMETERS_FIELD_NAMES.KERNEL_PARAMETERS],
                ),
              },
            }
          : {}),
        ...(values?.[ADDITIONAL_SETTINGS_BLOCK_FIELD_NAMES.SYNC_STANDBY_NODES]
          ? {
              synchronous_mode: true,
              synchronous_node_count: values[ADDITIONAL_SETTINGS_BLOCK_FIELD_NAMES.SYNC_STANDBY_NODES],
              ...(values?.[ADDITIONAL_SETTINGS_BLOCK_FIELD_NAMES.IS_SYNC_MODE_STRICT]
                ? { synchronous_mode_strict: true }
                : {}),
            }
          : {}),
      }
    : baseExtraVars;
};

/**
 * Converts an object's key-value pairs to an array of strings in the format "key=base64_encoded_value".
 *
 * If a value is a string, it is encoded directly to base64.
 * If a value is not a string, it is first stringified to JSON and then encoded to base64.
 *
 * @param object - The object whose key-value pairs are to be converted and encoded.
 * @returns An array of "key=base64_encoded_value" strings.
 */
const convertObjectValueToBase64Format = (object: Record<string, unknown>): string[] =>
  Object.entries(object).reduce<string[]>(
    (acc, [key, value]) => [
      ...acc,
      // Encode strings without extra quotes if value is a string, otherwise encode the JSON string.
      `${key}=${btoa(typeof value === 'string' ? value : JSON.stringify(value))}`,
    ],
    [],
  );

/**
 * Generates the request parameters for cloud provider clusters.
 *
 * Constructs the environment variables and extra_vars required for a cluster creation API request.
 * Environment variables are built out of secret fields, possibly encoded (base64) for GCP.
 *
 * @param values - Form values provided by the user.
 * @param secretsInfo - An object containing secret credentials/information.
 * @param customExtraVars - Optional custom extra_vars object (usually from YAML editor).
 * @returns An object containing 'envs' and 'extra_vars' for the API request.
 */
const getRequestCloudParams = (values, secretsInfo, customExtraVars) => {
  const secretsObject = Object.fromEntries(
    Object.entries({
      ...secretsInfo,
    }).filter(([key, value]) => SECRET_MODAL_CONTENT_BODY_FORM_FIELDS?.[key] && value),
  );

  return {
    envs:
      values[CLUSTER_FORM_FIELD_NAMES.PROVIDER]?.code === PROVIDERS.GCP
        ? convertObjectValueToBase64Format(secretsObject)
        : Object.entries(secretsObject).map(([key, value]) => `${key}=${value}`),
    extra_vars: customExtraVars ?? {
      ...getBaseClusterExtraVars(values),
      ...getCloudProviderExtraVars(values),
    },
  };
};

/**
 * Generates the request parameters for local machine clusters.
 *
 * Constructs the environment variables and extra_vars required for submitting
 * a local machine cluster creation API request. Environment variables are encoded
 * in base64 format.
 *
 * @param values - Form values provided by the user.
 * @param secretId - The optional ID of the secret, if one exists.
 * @param customExtraVars - Optional custom extra_vars object (usually from YAML editor).
 * @returns An object containing 'envs', 'extra_vars', and 'existing_cluster' for the API request.
 */
const getRequestLocalMachineParams = (values, secretId, customExtraVars) => ({
  envs: convertObjectValueToBase64Format(getLocalMachineEnvs(values, secretId)),
  extra_vars: customExtraVars ?? {
    ...getBaseClusterExtraVars(values),
    ...getLocalMachineExtraVars(values, secretId),
  },
  existing_cluster:
    values[CLUSTER_FORM_FIELD_NAMES.CREATION_TYPE] === CLUSTER_CREATION_TYPES.YAML
      ? customExtraVars?.existing_cluster?.toString() === 'true'
      : !!values?.[DATABASE_SERVERS_FIELD_NAMES.IS_CLUSTER_EXISTS],
});

/**
 * Maps cluster form values and related information to API request fields for cluster creation.
 *
 * This function prepares the parameters for the cluster creation API request
 * by combining form values, secret IDs, project IDs, and custom extra variables.
 * It determines the correct set of fields and formatting required based on the creation type
 * and provider, supporting both YAML and form-based creation flows.
 *
 * @param values - Filled form values.
 * @param secretId - Optional ID of secret if exists.
 * @param projectId - Optional ID of a current project.
 * @param secretsInfo - Optional object with secret information.
 * @param customExtraVars - Optional parameter with custom extra vars (from YAML editor).
 * @returns The cluster creation API request object.
 */
export const mapFormValuesToRequestFields = ({
  values,
  secretId,
  projectId,
  secretsInfo,
  customExtraVars,
}: {
  values: ClusterFormModalValues;
  secretId?: number;
  projectId: number;
  secretsInfo?: object;
  customExtraVars?: Record<string, never>;
}): RequestClusterCreate => {
  const baseObject = {
    ...(values[CLUSTER_FORM_FIELD_NAMES.CREATION_TYPE] === CLUSTER_CREATION_TYPES.YAML
      ? {
          name: customExtraVars?.patroni_cluster_name,
          environment_id: customExtraVars?.environment_id,
          description: customExtraVars?.description,
        }
      : {
          name: values[CLUSTER_FORM_FIELD_NAMES.CLUSTER_NAME],
          environment_id: values[CLUSTER_FORM_FIELD_NAMES.ENVIRONMENT_ID],
          description: values[CLUSTER_FORM_FIELD_NAMES.DESCRIPTION],
        }),
    ...(secretId ? { auth_info: { secret_id: secretId } } : {}),
    project_id: projectId,
  };

  ['environment_id', 'description'].forEach((field) => {
    if (!isEmpty(customExtraVars)) delete customExtraVars[field];
  });

  return {
    ...baseObject,
    ...((values[CLUSTER_FORM_FIELD_NAMES.CREATION_TYPE] === CLUSTER_CREATION_TYPES.YAML &&
      customExtraVars?.cloud_provider) ||
    (values[CLUSTER_FORM_FIELD_NAMES.CREATION_TYPE] === CLUSTER_CREATION_TYPES.FORM &&
      values?.[CLUSTER_FORM_FIELD_NAMES.PROVIDER]?.code !== PROVIDERS.LOCAL)
      ? getRequestCloudParams(values, secretsInfo, customExtraVars)
      : getRequestLocalMachineParams(values, secretId, customExtraVars)),
  };
};
