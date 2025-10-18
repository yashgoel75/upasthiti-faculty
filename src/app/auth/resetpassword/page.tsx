"use client";
import { useState, useEffect } from "react";
import logo from "@/assets/cleit.png";
import Image from "next/image";
import "./page.css";
import { sendPasswordResetEmail } from "firebase/auth";
import Link from "next/link";
import Footer from "../footer/page";
import { auth } from "@/lib/firebase";

export default function Member() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [falseEmailFormat, setFalseEmailFormat] = useState(false);
  const [isEmailEmpty, setIsEmailEmpty] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSuccess(false);

    if (name === "email") {
      setIsEmailEmpty(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.email == "") {
      setIsEmailEmpty(formData.email == "");
      return;
    }
    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      await sendPasswordResetEmail(auth, formData.email);
      setSuccess(true);
      console.log(success);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Password change error:", err);
        setError(err.message || "Failed to change password.");
      } else {
        setError("Error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const { email } = formData;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    setFalseEmailFormat(email ? !emailRegex.test(email) : false);
  }, [formData]);

  return (
    <>
      <div className="flex justify-center">
        <Image src={logo} width={isMobile ? 150 : 250} alt="cleit"></Image>
      </div>
      <div className="border-1 border-gray-200 mt-2"></div>
      <div className="w-[95%] lg:w-full max-w-4xl mx-auto pt-10">
        <div className="border md:text-lg border-gray-300 p-4 md:p-6 rounded-xl shadow-md bg-white mb-8">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Reset Password
          </h1>

          <form
            onSubmit={handleSubmit}
            className="space-y-1 md:space-y-2 lg:space-y-4"
          >
            <div>
              <label className="block mb-1 text-gray-700 font-medium">
                Email
              </label>
              <div className="flex items-center border border-gray-300 rounded-md">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="flex-1 px-4 py-2 outline-none"
                />
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
              <div className="flex text-sm md:text-base justify-center items-center bg-red-300 text-red-800 rounded px-3 text-center py-1">
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
            {success ? (
              <div className="text-sm md:text-base flex mt-1">
                If an account is associated with this email address, you will
                receive a password reset link shortly.
              </div>
            ) : null}

            <div className="text-center mt-3">
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
                  ? "Submitting..."
                  : success
                  ? "Reset Email Sent"
                  : "Reset Password"}
              </button>
            </div>
          </form>
        </div>
        <div className="text-center mb-8">
          Remember password?&nbsp;
          <Link href={"/auth/login"}>
            <u>Login now.</u>
          </Link>
        </div>
      </div>
      <div className="fixed w-full bottom-0 mt-5">
        <Footer />
      </div>
    </>
  );
}
