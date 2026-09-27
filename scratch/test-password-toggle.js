import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('--- Verifying Show/Hide Password Toggle Implementation ---');

// 1. Verify Login.jsx
const loginPath = path.resolve('hotel-frontend/hotel-frontend/src/pages/Login.jsx');
const loginSrc = fs.readFileSync(loginPath, 'utf8');

assert(loginSrc.includes('const [showPassword, setShowPassword] = useState(false)'), 'Login must use useState for showPassword');
assert(loginSrc.includes('type={showPassword ? \'text\' : \'password\'}'), 'Login input type must toggle between text and password');
assert(loginSrc.includes('className="password-input-wrapper"'), 'Login must wrap password input in password-input-wrapper');
assert(loginSrc.includes('className="password-toggle-btn"'), 'Login must have password-toggle-btn');
assert(loginSrc.includes('aria-label={showPassword ? \'Hide password\' : \'Show password\'}'), 'Login must have accessible aria-label');
assert(loginSrc.includes('type="button"'), 'Login toggle button must be type="button" to prevent submission');
assert(loginSrc.includes('setShowPassword((prev) => !prev)'), 'Login must toggle state on click');
console.log('✓ 1. Login.jsx show/hide password toggle fully verified');

// 2. Verify Signup.jsx
const signupPath = path.resolve('hotel-frontend/hotel-frontend/src/pages/Signup.jsx');
const signupSrc = fs.readFileSync(signupPath, 'utf8');

assert(signupSrc.includes('const [showPassword, setShowPassword] = useState(false)'), 'Signup must use useState for showPassword');
assert(signupSrc.includes('type={showPassword ? \'text\' : \'password\'}'), 'Signup input type must toggle between text and password');
assert(signupSrc.includes('className="password-input-wrapper"'), 'Signup must wrap password input in password-input-wrapper');
assert(signupSrc.includes('className="password-toggle-btn"'), 'Signup must have password-toggle-btn');
assert(signupSrc.includes('aria-label={showPassword ? \'Hide password\' : \'Show password\'}'), 'Signup must have accessible aria-label');
assert(signupSrc.includes('type="button"'), 'Signup toggle button must be type="button" to prevent submission');
assert(signupSrc.includes('setShowPassword((prev) => !prev)'), 'Signup must toggle state on click');
console.log('✓ 2. Signup.jsx show/hide password toggle fully verified');

// 3. Verify index.css
const cssPath = path.resolve('hotel-frontend/hotel-frontend/src/index.css');
const cssSrc = fs.readFileSync(cssPath, 'utf8');

assert(cssSrc.includes('.password-input-wrapper'), 'CSS must define .password-input-wrapper');
assert(cssSrc.includes('padding-right: 2.75rem'), 'Input must have right padding to avoid text overlapping icon');
assert(cssSrc.includes('.password-toggle-btn'), 'CSS must define .password-toggle-btn');
assert(cssSrc.includes('position: absolute'), 'Button must be absolutely positioned');
assert(cssSrc.includes('transform: translateY(-50%)'), 'Button must be vertically centered');
assert(cssSrc.includes(':focus-visible'), 'Button must have keyboard focus indicator');
console.log('✓ 3. index.css styles and accessibility verified');

console.log('\nALL CHECKS PASSED!');
