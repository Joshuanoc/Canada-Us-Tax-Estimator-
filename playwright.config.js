import {defineConfig} from '@playwright/test';
const port=Number(process.env.TAXMETRIC_PORT||5175);
if(!Number.isInteger(port)||port<1||port>65535)throw new Error('Invalid test port');
export default defineConfig({
 testDir:'./tests',testMatch:'**/*.spec.js',fullyParallel:true,workers:process.env.CI?2:undefined,
 forbidOnly:!!process.env.CI,retries:0,
 reporter:[['list'],['html',{open:'never'}]],
 use:{baseURL:`http://127.0.0.1:${port}`,trace:'retain-on-failure',
  launchOptions:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{}},
 webServer:{command:`PORT=${port} npm run dev`,url:`http://127.0.0.1:${port}`,reuseExistingServer:!process.env.CI,timeout:30000}
});
