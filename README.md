# auth0-core-rbac-rule

## Context
With Auth0 Core RBAC, we get all the features we need to authenticate and authorize user to our applications with role based access control. The Auth0 Authorization Extension allowed us to easily add the users role, permissions, and groups to our app_metadata, as well as spreading this data onto the idToken and accessToken for each login. Lastly, the UI these two features offers is very easy to use and extensible through the management API.


## The problem
Auth0 Authozition extension only applies roles to users once the user logs into your app, and then you update the roles assigned to that user via the Management API, or via the web UI. Alternatively Auth0 Core doesn't not apply roles to a user when they login. Auth0 provides a built in rule to apply a role to a user by updating their app_metadata on login. This however does not actually update the users data in the management API to reflect their role, and therefor their permissions don't get spread onto the accessToken. Lastly, no implementation that I could find applies a role to a user, assigns that user a multi-tenant organization ID, applies the permissions associated with their role to the user, and finally updates the app_metadata with all this data. 

## The Solution
I created a rule that integrates with Auth0 Core RBAC because going forward Auth0 will deprecate the extension. I like the idea of native RBAC within Auth0 and my tenant. Auth0 Core also provides more scalability and features than then extension. In the future I should be able to simply flip this rule off when Auth0 implements their own native version of role assignment, multi-tenancy apps, and showing this data in tokens and metadata.

