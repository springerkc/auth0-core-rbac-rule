function (user, context, callback) {
	const fetch = require('node-fetch');
  const namespace = 'https://<someDomain>.com/';
  const base = 'https://<someDomain>.auth0.com';
  const domain = user.email.split('@')[1].split('.com')[0];
  user.app_metadata = user.app_metadata || {};

  const setRoles = (person) => {
    if (person.email && person.email === 'admin@somedomain.com') {
      user.app_metadata.roles = ['godmode'];
      return configuration.godmode;
    }
    if (person.email && person.email === 'tenant-admin@adifferentdomain.com') {
      user.app_metadata.roles = ['Tenant Admin'];
      return configuration.tenantadmin;
    }
    if (!person.email || !person.email_verified) {
      user.app_metadata.roles = ['Tenant User'];
      return configuration.tenantuser;
    }
    user.app_metadata.roles = ['Tenant User'];
    return configuration.tenantuser;
  };

  if (Object.keys(configuration).includes(domain)) {
    context.idToken[`${namespace}organization`] = configuration[domain];
    context.accessToken[`${namespace}organization`] = configuration[domain];
    user.app_metadata.organization = configuration[domain];
  }

  const opts = {
    grant_type: 'client_credentials',
    client_id: '<m2mAppClientId>',
    client_secret: '<m2mAppClientSecret>',
    audience: `${base}/api/v2/`,
  };
  let at;

  (async () => {
    try {
      at = await (await fetch(`${base}/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(opts),
      })).json();

      if (at && at.access_token) {
        const role = setRoles(user);
        const usid = { users: [`${user.user_id}`] };
        await fetch(`${base}/api/v2/roles/${role}/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${at.access_token}`,
            'cache-control': 'no-cache',
          },
          body: JSON.stringify(usid),
        });

        context.idToken[`${namespace}roles`] = user.app_metadata.roles;
        context.accessToken[`${namespace}roles`] = user.app_metadata.roles;

        const prms = await (
          await fetch(`${base}/api/v2/roles/${role}/permissions`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              authorization: `Bearer ${at.access_token}`,
              'cache-control': 'no-cache',
            },
          })
        ).json();
        
        if (prms && prms.length >= 1) {
          const perms = prms.map(p => p.permission_name);
          context.idToken[`${namespace}permissions`] = perms;
          user.app_metadata.permissions = perms;
        }
        
        auth0.users.updateAppMetadata(user.user_id, user.app_metadata)
           .then(() => {
             callback(null, user, context);
           })
           .catch(err => {
             callback(err);
           });
      }
    } catch (err) {
      callback(err);
    }
  })();
}
