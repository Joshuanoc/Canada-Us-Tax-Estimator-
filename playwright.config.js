import {defineConfig} from '@playwright/test';
export default defineConfig({
 testDir:'./tests',testMatch:'**/*.spec.js',fullyParallel:true,workers:process.env.CI?2:undefined,
 forbidOnly:!!process.env.CI,retries:0,
 reporter:[['list'],['html',{open:'never'}]],
 use:{baseURL:'http://127.0.0.1:5175',trace:'retain-on-failure',
  launchOptions:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{}},
 webServer:{command:'npm run dev',url:'http://127.0.0.1:5175',reuseExistingServer:!process.env.CI,timeout:30000}
});
