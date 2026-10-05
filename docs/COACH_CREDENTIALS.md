# Coach login credentials: backend change needed

## What the admin panel does

When the super admin adds a coach, a login password is **auto-generated**. The admin can see it at
any time, along with the coach's email:

- **Coach Directory**: key icon → "Coach Login Credentials" popup (Temporary Password + Copy Credentials)
- **Coach Profile**: "Portal Login Credentials" card (Default Password + Copy)

The coach signs in with that email and password straight away. The coach does not set a password.

## What the backend does today

`create_coach` (app/modules/coaches/service.py) saves the user with `password_hash=None` and emails
an invite link. No password exists and none is returned, so the admin screens show "—" and the
coach cannot sign in.

## Change needed

1. **Generate the password when the coach is created** (`create_coach`):

   ```python
   import secrets
   from app.core.security import hash_password

   temporary_password = secrets.token_urlsafe(9)  # ~12 characters, meets the 10-character minimum
   user = User(email=email, full_name=data.full_name, role=Role.COACH,
               password_hash=hash_password(temporary_password))
   ```

   Login keeps checking `password_hash` as it does now.

2. **Keep the password so the admin can view it later.** Store it in a new column, e.g.
   `CoachProfile.temporary_password` (alembic migration). Preferably encrypt it with a key from
   settings; at minimum make sure only admins can ever read it.

3. **Return it to admins** as `temporaryPassword` (camelCase) on `CoachListItem` (and so on
   `CoachDetail`) in app/modules/coaches/schemas.py:

   ```python
   temporary_password: str | None = None
   ```

   Fill it in from `GET /coaches`, `GET /coaches/{id}`, `POST /coaches` and `PATCH /coaches/{id}`.
   These routes are already admin-only. Never include it in `/coach/*`, `/auth/me` or any public
   endpoint.

4. **Optional:** if the coach changes their password themselves (`POST /auth/change-password`),
   set the stored `temporary_password` to `NULL`, because it no longer works. The admin screen then
   shows "—".

5. **Optional:** the invite email can be turned off for coaches, or kept to send them the login
   details.

## Frontend contract (already implemented)

| Endpoint | Field the frontend reads |
|---|---|
| `GET /coaches`, `GET /coaches/{id}`, `POST /coaches` | `tempPassword` (or `defaultPassword` / `temporaryPassword`): `string \| null` |

Frontend files: `src/api/types.ts` (`CoachListItem.temporaryPassword`), `src/api/mappers.ts`
(`toCoach` → `tempPassword`), `src/components/ui/CoachCredentialsModal.tsx`,
`src/pages/super-admin/CoachProfilePage.tsx`.
