import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthForm() {
  const { signIn, signUp, signOut, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (user) {
    return (
      <div className="p-4">
        <p>Welcome, {user.email}</p>
        <button onClick={signOut} className="bg-red-500 text-white px-4 py-2 rounded">
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2">
      <input
        type="email"
        placeholder="Email"
        className="border p-2 w-full"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="border p-2 w-full"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="flex gap-2">
        <button
          onClick={() => signIn(email, password)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Sign In
        </button>
        <button
          onClick={() => signUp(email, password)}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
