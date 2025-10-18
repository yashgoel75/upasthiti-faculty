"use client";

import logo from "@/assets/upasthiti.png"
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Footer from "../footer/page";
import Link from "next/link";
import {
  onAuthStateChanged,
  User,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../../../lib/firebase";
import { log } from "console";
export default function Login() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "member",
  });

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/dashboard");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [falseEmailFormat, setFalseEmailFormat] = useState(false);
  const [falsePasswordFormat, setFalsePasswordFormat] = useState(false);

  const [isEmailEmpty, setIsEmailEmpty] = useState(false);
  const [isPasswordEmpty, setIsPasswordEmpty] = useState(false);
  const [isRoleEmpty, setIsRoleEmpty] = useState(false);

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(false);
    if (name === "email") {
      setIsEmailEmpty(false);
    }
    if (name == "password") {
      setIsPasswordEmpty(false);
    }
    if (name == "role") {
      setIsRoleEmpty(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      formData.email == "" ||
      formData.password == "" ||
      formData.role == ""
    ) {
      setIsEmailEmpty(formData.email == "");
      setIsPasswordEmpty(formData.password == "");
      setIsRoleEmpty(formData.role == "");
      return;
    }
    setIsSubmitting(true);
    setError(false);
    setSuccess(false);

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      setSuccess(true);
      setTimeout(() => router.replace("/dashboard"), 1500);
    } catch (err) {
      setError(true);
      // console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const { email, password } = formData;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    setFalseEmailFormat(email ? !emailRegex.test(email) : false);

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/;
    setFalsePasswordFormat(password ? !passwordRegex.test(password) : false);
  }, [formData]);

  return (
    <>
      <div className="flex justify-center">
        <Image src={logo} width={250} alt="upasthiti"></Image>
      </div>
      <div className="border-1 border-gray-200 mt-2"></div>
      <div className="w-[95%] lg:w-full max-w-4xl mx-auto pt-10">
        <div className="border md:text-lg border-gray-300 p-6 rounded-xl shadow-md bg-white mb-8">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Login to Upasthiti
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex-1">
              <div>
                <div>
                  <label className="block mb-1 text-gray-700 font-medium">
                    Email
                  </label>
                  <div className="flex items-center">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                    />
                  </div>
                </div>
              </div>
              {isEmailEmpty ? (
                <div className="text-sm flex text-[#8C1A10] mt-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="18px"
                    viewBox="0 -960 960 960"
                    width="18px"
                    fill="#8C1A10"
                  >
                    <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                  </svg>
                  &nbsp; Please enter your email
                </div>
              ) : null}
            </div>
            {falseEmailFormat ? (
              <div className="flex text-sm md:text-base justify-center md:items-center bg-red-300 text-red-800 rounded px-3 text-center py-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height={isMobile ? "20px" : "24px"}
                  viewBox="0 -960 960 960"
                  width={isMobile ? "20px" : "24px"}
                  fill="#992B15"
                >
                  <path d="m40-120 440-760 440 760H40Zm138-80h604L480-720 178-200Zm302-40q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm-40-120h80v-200h-80v200Zm40-100Z" />
                </svg>
                &nbsp; Please enter a valid email address
              </div>
            ) : null}
            <div>
              <div className="flex items-center">
                <label className="block mb-1 text-gray-700 font-medium">
                  Password&nbsp;
                </label>
                <svg
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  xmlns="http://www.w3.org/2000/svg"
                  height="20px"
                  viewBox="0 -960 960 960"
                  width="20px"
                  fill="#000000"
                >
                  <path
                    d={
                      isPasswordVisible
                        ? "M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z"
                        : "m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm128 126-58-56q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.5t90-8.5q151 0 269 83.5T920-500q-23 59-60.5 109.5T772-302Zm20 246L624-222q-35 11-70.5 16.5T480-200q-151 0-269-83.5T40-500q21-53 53-98.5t73-81.5L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z"
                    }
                  />
                </svg>
              </div>
              <div className="flex items-center">
                <input
                  type={isPasswordVisible ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={
                    isPasswordVisible ? "superstrongpassword" : "••••••"
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                />
              </div>

              <div className="text-sm flex text-[#8C1A10] mt-1">
                <Link href={"/auth/resetpassword"}>Forgot Password?</Link>
              </div>

              {isPasswordEmpty ? (
                <div className="text-sm flex text-[#8C1A10] mt-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="18px"
                    viewBox="0 -960 960 960"
                    width="18px"
                    fill="#8C1A10"
                  >
                    <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                  </svg>
                  &nbsp; Please enter password
                </div>
              ) : null}
            </div>
            {falsePasswordFormat ? (
              <div className="flex text-sm md:text-base justify-center md:items-center bg-red-300 text-red-800 rounded px-3 text-center py-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height={isMobile ? "20px" : "24px"}
                  viewBox="0 -960 960 960"
                  width={isMobile ? "20px" : "24px"}
                  fill="#992B15"
                >
                  <path d="m40-120 440-760 440 760H40Zm138-80h604L480-720 178-200Zm302-40q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm-40-120h80v-200h-80v200Zm40-100Z" />
                </svg>
                &nbsp; Please enter a valid password format
              </div>
            ) : null}

            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting || success}
                className={`w-full bg-indigo-500 text-white px-6 py-2 rounded-md font-semibold transition hover:bg-indigo-700 ${
                  isSubmitting || success
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:cursor-pointer"
                }`}
              >
                {isSubmitting
                  ? "Logging in..."
                  : success
                  ? "Redirecting... Please Wait"
                  : "Login"}
              </button>
            </div>
          </form>
          {error ? (
            <div className="flex text-sm md:text-base justify-center items-center mt-2 bg-red-300 text-red-800 rounded px-3 text-center py-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height={isMobile ? "20px" : "24px"}
                viewBox="0 -960 960 960"
                width={isMobile ? "20px" : "24px"}
                fill="#992B15"
              >
                <path d="m40-120 440-760 440 760H40Zm138-80h604L480-720 178-200Zm302-40q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm-40-120h80v-200h-80v200Zm40-100Z" />
              </svg>
              &nbsp; Invalid Credentials
            </div>
          ) : null}
        </div>
      </div>
      <div className="fixed w-full bottom-0 mt-5">
        <Footer />
      </div>
    </>
  );
}
