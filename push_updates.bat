@echo off
cd c:\Users\arjun\OneDrive\Documents\AJ SYNAPSE
git pull origin main --rebase
git add vercel.json 
git commit -m "Vercel config"
git push origin main
echo Done
pause
