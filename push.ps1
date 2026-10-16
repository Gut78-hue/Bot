param (
    [string]$RepoUrl
)

$git = "C:\Users\chinm\.gemini\antigravity\scratch\bin\git\cmd\git.exe"
if (-not (Test-Path $git)) {
    $git = "git"
}

if (-not $RepoUrl) {
    Write-Host "Please provide your GitHub repository URL:" -ForegroundColor Yellow
    $RepoUrl = Read-Host "GitHub Repo URL (e.g. https://github.com/your-username/your-repo.git)"
}

if (-not $RepoUrl) {
    Write-Host "No URL provided. Aborting." -ForegroundColor Red
    exit 1
}

Write-Host "Setting remote origin to $RepoUrl..." -ForegroundColor Cyan
& $git remote remove origin 2>$null
& $git remote add origin $RepoUrl

Write-Host "Pushing main branch to GitHub..." -ForegroundColor Cyan
& $git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "Successfully pushed to GitHub! Ready to deploy on Render.com" -ForegroundColor Green
} else {
    Write-Host "Push encountered an issue. Check your repository permissions or personal access token." -ForegroundColor Red
}
