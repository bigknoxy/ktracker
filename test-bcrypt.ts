import bcrypt from 'bcrypt';

async function testBcrypt() {
  const password = 'password123';
  console.log('Original password:', password);

  const hashed = await bcrypt.hash(password, 10);
  console.log('Hashed password:', hashed);

  const isValid = await bcrypt.compare(password, hashed);
  console.log('Password comparison result:', isValid);

  // Test with wrong password
  const isValidWrong = await bcrypt.compare('wrongpassword', hashed);
  console.log('Wrong password comparison result:', isValidWrong);
}

testBcrypt().catch(console.error);