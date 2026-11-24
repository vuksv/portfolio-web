# Deploying

Every push to `master` runs `.github/workflows/deploy.yml`: it validates the content files with `npm test`, then deploys to App Engine and promotes the new version. Pull requests run the check only. You can also start a deploy from the Actions tab ("Run workflow").

GitHub signs in to Google with Workload Identity Federation, so no service account key is stored in GitHub.

## One-time setup

Run these once in Cloud Shell or anywhere `gcloud` is signed in as a project owner. Replace `PROJECT_ID`.

```sh
PROJECT_ID=your-project-id
REPO=vuksv/portfolio-web
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')

gcloud services enable appengine.googleapis.com cloudbuild.googleapis.com iamcredentials.googleapis.com \
  artifactregistry.googleapis.com --project "$PROJECT_ID"

# Service account the workflow deploys as
gcloud iam service-accounts create github-deployer --project "$PROJECT_ID" --display-name "GitHub deployer"
SA="github-deployer@$PROJECT_ID.iam.gserviceaccount.com"
for ROLE in roles/appengine.deployer roles/appengine.serviceAdmin roles/cloudbuild.builds.editor \
            roles/storage.admin roles/artifactregistry.writer; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" --member "serviceAccount:$SA" --role "$ROLE" --condition=None
done
# Lets the deployer act as App Engine's runtime account
gcloud iam service-accounts add-iam-policy-binding "$PROJECT_ID@appspot.gserviceaccount.com" \
  --project "$PROJECT_ID" --member "serviceAccount:$SA" --role roles/iam.serviceAccountUser

# Trust GitHub Actions from this repository only
gcloud iam workload-identity-pools create github --project "$PROJECT_ID" --location global --display-name "GitHub"
gcloud iam workload-identity-pools providers create-oidc portfolio-web --project "$PROJECT_ID" \
  --location global --workload-identity-pool github \
  --issuer-uri "https://token.actions.githubusercontent.com" \
  --attribute-mapping "google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --attribute-condition "assertion.repository == '$REPO'"
gcloud iam service-accounts add-iam-policy-binding "$SA" --project "$PROJECT_ID" \
  --role roles/iam.workloadIdentityUser \
  --member "principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github/attribute.repository/$REPO"

echo "GCP_PROJECT_ID=$PROJECT_ID"
echo "GCP_SERVICE_ACCOUNT=$SA"
echo "GCP_WORKLOAD_IDENTITY_PROVIDER=projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github/providers/portfolio-web"
```

Then add the three printed values as **repository variables** (not secrets; none of them is sensitive) under GitHub → Settings → Secrets and variables → Actions → Variables, or with the GitHub CLI:

```sh
gh variable set GCP_PROJECT_ID --body "$PROJECT_ID" -R vuksv/portfolio-web
gh variable set GCP_SERVICE_ACCOUNT --body "$SA" -R vuksv/portfolio-web
gh variable set GCP_WORKLOAD_IDENTITY_PROVIDER --body "projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github/providers/portfolio-web" -R vuksv/portfolio-web
```

The deploy job uses a GitHub environment named `production`. GitHub creates it on the first run; add a required reviewer there if you ever want to approve deploys by hand.
