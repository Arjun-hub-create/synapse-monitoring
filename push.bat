@echo off
cd "c:\Users\arjun\OneDrive\Documents\AJ SYNAPSE"
set GIT_EDITOR=true
set GIT_PAGER=
git config core.pager ""
git config core.editor true
git rm --force .python-version
git rm --force runtime.txt
git commit -m "Remove Python version files from root directory"
git push origin main
echo.
echo Done! Vercel rebuild triggered.
pause
