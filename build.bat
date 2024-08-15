@echo off
setlocal EnableDelayedExpansion


rmdir /s /q %~dp0log
rmdir /s /q %~dp0build
md %~dp0build
copy installer.nsh %~dp0build\installer.nsh


npm run build