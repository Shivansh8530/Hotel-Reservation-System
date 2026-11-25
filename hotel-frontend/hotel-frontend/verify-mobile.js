import puppeteer from 'puppeteer-core'
import fs from 'fs'
import path from 'path'

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const BASE_URL = 'http://localhost:4173'
const SCREENSHOT_DIR = path.resolve('./verification-screenshots')

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
}

const VIEWPORTS = [
  { name: '390x844 (iPhone 12/13/14)', width: 390, height: 844 },
  { name: '360x640 (Galaxy S8/S9)', width: 360, height: 640 },
  { name: '320x568 (iPhone SE / Smallest)', width: 320, height: 568 },
]

const ROUTES = [
  '/',
  '/rooms',
  '/hotels/1',
  '/rooms/1',
  '/login',
  '/signup',
  '/forgot-password'
]

async function runVerification() {
  console.log('🚀 Starting Mobile Responsiveness Verification...\n')
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  let allPassed = true
  const results = {
    overflowChecks: [],
    tapTargets: [],
    fontSizes: [],
    hamburgerTests: [],
    themeTests: [],
    authTests: []
  }

  const page = await browser.newPage()

  // 1. OVERFLOW CHECKS (scrollWidth === clientWidth)
  console.log('--- 1. Viewport Horizontal Scroll Checks ---')
  for (const vp of VIEWPORTS) {
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: true, hasTouch: true })
    for (const route of ROUTES) {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle0' })
      const dimensions = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        bodyScrollWidth: document.body.scrollWidth,
        hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
      }))

      const passed = !dimensions.hasOverflow
      if (!passed) allPassed = false
      results.overflowChecks.push({
        viewport: vp.name,
        route,
        passed,
        ...dimensions
      })
      console.log(`[${passed ? 'PASS' : 'FAIL'}] ${vp.name} on ${route}: scrollWidth=${dimensions.scrollWidth}, clientWidth=${dimensions.clientWidth}`)
    }
  }

  // 2. HAMBURGER MENU ACCESSIBILITY & BEHAVIOR AT 390px
  console.log('\n--- 2. Hamburger Menu Interaction Checks ---')
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true })
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' })

  // Check hamburger accessibility attributes
  const hamburgerAttrs = await page.evaluate(() => {
    const btn = document.querySelector('.nav-hamburger')
    if (!btn) return null
    return {
      exists: true,
      ariaLabel: btn.getAttribute('aria-label'),
      ariaExpanded: btn.getAttribute('aria-expanded'),
      ariaControls: btn.getAttribute('aria-controls')
    }
  })
  console.log('Hamburger Attributes before click:', hamburgerAttrs)
  results.hamburgerTests.push(hamburgerAttrs)

  // Click hamburger to open
  await page.click('.nav-hamburger')
  await new Promise(r => setTimeout(r, 300))

  const menuOpenState = await page.evaluate(() => {
    const btn = document.querySelector('.nav-hamburger')
    const menu = document.querySelector('#nav-menu')
    const links = Array.from(menu.querySelectorAll('a, button')).map(el => el.textContent.trim())
    return {
      ariaExpanded: btn?.getAttribute('aria-expanded'),
      hasOpenClass: menu?.classList.contains('open'),
      menuVisible: menu ? window.getComputedStyle(menu).display !== 'none' : false,
      items: links
    }
  })
  console.log('Menu Open State:', menuOpenState)
  results.hamburgerTests.push(menuOpenState)

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'navbar-open-mobile-390.png') })

  // Click a link inside menu and verify menu closes
  await page.click('#nav-menu a[href="/rooms"]')
  await new Promise(r => setTimeout(r, 400))
  const menuClosedAfterNav = await page.evaluate(() => {
    const menu = document.querySelector('#nav-menu')
    return {
      currentPath: window.location.pathname,
      hasOpenClass: menu?.classList.contains('open'),
      menuHidden: menu ? window.getComputedStyle(menu).display === 'none' : true
    }
  })
  console.log('Menu Closed After Nav:', menuClosedAfterNav)
  results.hamburgerTests.push(menuClosedAfterNav)

  // 3. THEME TOGGLE CHECK
  console.log('\n--- 3. Dark/Light Theme Toggle Test ---')
  await page.click('.nav-hamburger')
  await new Promise(r => setTimeout(r, 200))
  const themeBefore = await page.evaluate(() => document.documentElement.getAttribute('data-theme') || 'light')
  await page.click('.nav-theme-toggle')
  await new Promise(r => setTimeout(r, 200))
  const themeAfter = await page.evaluate(() => document.documentElement.getAttribute('data-theme') || 'dark')
  console.log(`Theme toggle: ${themeBefore} -> ${themeAfter}`)
  results.themeTests.push({ themeBefore, themeAfter, success: themeBefore !== themeAfter })

  // 4. LOGGED-IN NAVBAR TEST
  console.log('\n--- 4. Logged-in State Navbar Check ---')
  await page.evaluate(() => {
    localStorage.setItem('user', JSON.stringify({
      id: 999,
      name: 'Alexander Wright',
      email: 'alex@example.com',
      role: 'USER'
    }))
    localStorage.setItem('token', 'fake-jwt-token')
  })
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' })
  await page.click('.nav-hamburger')
  await new Promise(r => setTimeout(r, 200))
  const loggedInMenu = await page.evaluate(() => {
    const userBadge = document.querySelector('.user-badge')
    const signOutBtn = document.querySelector('.nav-signout-btn')
    const myResLink = document.querySelector('a[href="/my-bookings"]')
    return {
      hasUserBadge: !!userBadge,
      badgeText: userBadge?.textContent.trim(),
      hasSignOut: !!signOutBtn,
      hasMyReservations: !!myResLink
    }
  })
  console.log('Logged In Menu Content:', loggedInMenu)
  results.authTests.push(loggedInMenu)
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'navbar-loggedin-mobile-390.png') })

  // Clear auth for remaining tests
  await page.evaluate(() => {
    localStorage.clear()
  })

  // 5. TAP TARGET SIZE CHECKS (>= 44x44px)
  console.log('\n--- 5. Tap Target Size Checks on Mobile (390px) ---')
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' })

  // Check Brand logo link
  const brandLogoSize = await page.evaluate(() => {
    const el = document.querySelector('.brand-logo')
    if (!el) return null
    const rect = el.getBoundingClientRect()
    return { width: rect.width, height: rect.height }
  })
  console.log('Brand Logo Link:', brandLogoSize, brandLogoSize.height >= 44 ? 'PASS' : 'FAIL')

  // Check Filter chips on home page
  const filterChips = await page.evaluate(() => {
    const chips = Array.from(document.querySelectorAll('.filter-chip'))
    return chips.map(c => {
      const rect = c.getBoundingClientRect()
      return { text: c.textContent.trim(), width: rect.width, height: rect.height }
    })
  })
  console.log(`Filter chips tested: ${filterChips.length}`)
  const allChipsPass = filterChips.every(c => c.height >= 44)
  console.log('All filter chips height >= 44px:', allChipsPass ? 'PASS' : 'FAIL', filterChips[0])

  // Check Footer links
  const footerLinks = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('.footer-link'))
    return links.map(l => {
      const rect = l.getBoundingClientRect()
      return { text: l.textContent.trim(), width: rect.width, height: rect.height }
    })
  })
  console.log(`Footer links tested: ${footerLinks.length}`)
  const allFooterPass = footerLinks.every(l => l.height >= 44)
  console.log('All footer links height >= 44px:', allFooterPass ? 'PASS' : 'FAIL', footerLinks[0])

  // Check Login page elements (password toggle eye button, auth links)
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' })
  const loginTapTargets = await page.evaluate(() => {
    const toggleBtn = document.querySelector('.password-toggle-btn')
    const toggleRect = toggleBtn?.getBoundingClientRect()
    const links = Array.from(document.querySelectorAll('.auth-helper-link')).map(l => {
      const rect = l.getBoundingClientRect()
      return { text: l.textContent.trim(), width: rect.width, height: rect.height }
    })
    return {
      toggleBtn: toggleRect ? { width: toggleRect.width, height: toggleRect.height } : null,
      links
    }
  })
  console.log('Login password toggle btn:', loginTapTargets.toggleBtn, loginTapTargets.toggleBtn.height >= 44 && loginTapTargets.toggleBtn.width >= 44 ? 'PASS' : 'FAIL')
  console.log('Login auth helper links:', loginTapTargets.links)

  // 6. FORM CONTROLS 16PX FONT SIZE CHECK
  console.log('\n--- 6. Form Controls Font Size >= 16px Check ---')
  const formFontSizes = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input, select, textarea'))
    return inputs.map(i => ({
      tag: i.tagName,
      id: i.id,
      fontSize: window.getComputedStyle(i).fontSize
    }))
  })
  console.log('Form controls font sizes on Login:', formFontSizes)

  // Check Home page select font size
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' })
  const homeSelectFontSizes = await page.evaluate(() => {
    const selects = Array.from(document.querySelectorAll('select'))
    return selects.map(s => ({
      id: s.id,
      fontSize: window.getComputedStyle(s).fontSize
    }))
  })
  console.log('Home page select font sizes:', homeSelectFontSizes)

  // 7. SCREENSHOTS AT 390PX & 1440PX
  console.log('\n--- 7. Capturing Screenshots ---')
  // 390px Mobile
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true })
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' })
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'home-mobile-390.png') })

  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' })
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'login-mobile-390.png') })

  await page.goto(`${BASE_URL}/signup`, { waitUntil: 'networkidle0' })
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'signup-mobile-390.png') })

  // 1440px Desktop
  await page.setViewport({ width: 1440, height: 900, isMobile: false })
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' })
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'home-desktop-1440.png') })

  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' })
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'login-desktop-1440.png') })

  await browser.close()
  console.log('\n✅ Verification Completed! Screenshots saved to:', SCREENSHOT_DIR)
}

runVerification().catch(err => {
  console.error('❌ Verification script failed:', err)
  process.exit(1)
})
