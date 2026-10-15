# Admin portal deployment

Production: **https://admin.malabarchallengersfc.com** (super-admin and coach portal), on the same Hostinger
VPS as the backend (`187.126.124.243`). Server access, accounts, backups and security are described in the
backend runbook: `MSRF-Backend/deploy/README.md`.

## How a change reaches production

```
git push origin main
  └─ GitHub Actions (.github/workflows/ci-cd.yml)
       1. build    Docker image (npm ci, tsc + vite build, nginx) -> ghcr.io/zuarakcore/msrf-admin:<commit sha>
       2. deploy   scp compose.yml + deploy.sh -> /srv/msrf/admin, then deploy.sh <sha>
                     unhealthy? -> previous version is started again and the job fails
       3. check    https://admin.malabarchallengersfc.com/
```

Pull requests run step 1 without pushing the image. The API address (`VITE_API_BASE_URL`) is baked in at
build time from `.env.production`. The browser calls `https://api.malabarchallengersfc.com` directly; the
refresh cookie works because `admin.` and `api.` are the same site.

## On the server

```
/srv/msrf/admin/              owned by `deploy`
├── compose.yml               replaced by CI on every deploy (source: deploy/admin/compose.yml)
├── deploy.sh                 replaced by CI on every deploy
└── .deploy-history           one line per successful deploy: <time> <sha>
```

Container `msrf-admin-web-1` (nginx serving the static build on port 8080, read-only, non-root, 128 MB)
joins the `edge` network as `msrf-admin`. Caddy (`/srv/msrf/proxy/Caddyfile`) terminates HTTPS:

```caddyfile
admin.malabarchallengersfc.com {
	import access_log
	encode zstd gzip
	header {
		Strict-Transport-Security "max-age=31536000"
		X-Content-Type-Options "nosniff"
		X-Frame-Options "DENY"
		Referrer-Policy "strict-origin-when-cross-origin"
		Permissions-Policy "camera=(), microphone=(), geolocation=()"
		X-Robots-Tag "noindex, nofollow"
	}
	reverse_proxy msrf-admin:8080
}
```

## Everyday commands (as root)

```bash
cd /srv/msrf/admin && export IMAGE_TAG=$(tail -n1 .deploy-history | awk '{print $2}')
docker compose ps                       # "Up (healthy)"
docker compose logs -f --tail 100 web   # logs
```

Roll back: GitHub → Actions → last good run on `main` → **Re-run all jobs**, or on the server
`sudo -u deploy /srv/msrf/admin/deploy.sh <older sha>` (from `.deploy-history`; the 5 newest images are kept).
