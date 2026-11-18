import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "rasdpulse-super-secret-key-change-me-in-production-2026"
);

export type UserRole = "admin" | "operator" | "viewer";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  passwordHash: string;
  createdAt: string;
}

// Simple in-memory store for demo (replace with DB in production)
let users: User[] = [
  {
    id: "1",
    email: "admin@rasdpulse.com",
    name: "Admin",
    role: "admin",
    passwordHash: bcrypt.hashSync("admin123", 10),
    createdAt: new Date().toISOString(),
  },
];

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createToken(user: Omit<User, "passwordHash">) {
  return new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as {
      id: string;
      email: string;
      name: string;
      role: UserRole;
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("rasdpulse_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function findUserByEmail(email: string) {
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function createUser(data: {
  email: string;
  name: string;
  password: string;
  role?: UserRole;
}) {
  const existing = findUserByEmail(data.email);
  if (existing) throw new Error("User already exists");

  const user: User = {
    id: generateId(),
    email: data.email,
    name: data.name,
    role: data.role || "viewer",
    passwordHash: bcrypt.hashSync(data.password, 10),
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export function getAllUsers() {
  return users.map(({ passwordHash, ...u }) => u);
}
