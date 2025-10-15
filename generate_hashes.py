import bcrypt

def hash_password(password):
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    return hashed_password.decode('utf-8')

passwords = ['password123', 'securepass', 'testpass']
hashed_passwords = [hash_password(p) for p in passwords]

for i, p in enumerate(hashed_passwords):
    print(f'Hashed password for passwords[{i}]: {p}')

