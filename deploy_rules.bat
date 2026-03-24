@echo off
echo ==============================================
echo [ IBE Construction ] DEPLOIEMENT FIREBASE SECURITY
echo ==============================================
echo.
echo Ce script va initialiser et deployer vos nouvelles
echo regles de securite sur votre projet Firebase.
echo.

echo 1. Verification de Firebase CLI...
call npx --no-install firebase-tools --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
  echo Installation de firebase-tools depuis npm...
  call npm install -g firebase-tools
)

echo.
echo 2. Connexion a votre compte Google Firebase...
echo (Si vous etes deja connecte, cette etape sera rapide)
call npx firebase-tools login

echo.
echo 3. Deploiement des regles Firestore et Storage...
call npx firebase-tools deploy --only firestore:rules,storage

echo.
echo ==============================================
echo TERMINÉ ! Vos donnees sont desormais securisees.
echo ==============================================
pause
