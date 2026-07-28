//Dependencies
import { useState, useEffect } from "react";
//Types 
import type {User} from './types.ts';

export default function Register() {
  

  //States
  const [businessName, setBusinessName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordConfirm, setPasswordConfirm] = useState<string>("");
  const [errorUI, setErrorUI] = useState<Boolean | null | undefined>(null);
  const [errorMessageUI, setErrorMessageUI] = useState<string []>([]);
  const [success, setSuccess] = useState<boolean>(false);
  const [errorServer, setErrorServer] = useState<boolean>(false);

  //Handlers & validators
  function validateEmail(e : string) {
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
    if(!emailRegex.test(e)) return false;
    return true;
  }

  function validatePassword(p: string) {
    const regexSym : RegExp  = /^[@|!|$|%|&|*|(|(]$/i;
    let hasCap : boolean = false;
    let l : number = 0;
    let hasSymbol : boolean = false;
    for(const char of p) {
        if(char == char.toUpperCase()) hasCap = true;
        if(regexSym.test(char)) hasSymbol = true;
        l++;
    }
    return l >= 10 && hasCap && hasSymbol;
  } 

  function checkForm(name : string, emailAddress : string,pass : string,con : string) {

    setErrorUI(false);

    if(name == "" || name.length < 3) {
        setErrorMessageUI(prev => [...prev, "Please enter a valid business name."]);
        setErrorUI(true);
    }
    if(emailAddress == "" || !validateEmail(emailAddress)) {
        setErrorMessageUI(prev => [...prev, "Please enter a valid email address."]);
        setErrorUI(true);
    }
    if(pass == "" || !validatePassword(pass)) {
        setErrorMessageUI(prev => [...prev, "Please enter a valid password of length 10, that contains an uppercase character and a symbol."]);
        setErrorUI(true);
    }
    if(pass != con) {
        setErrorMessageUI(prev => [...prev, "Please confirm the password."]);
        setErrorUI(true);
    }
  }

  function submitForm(e : React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    if(errorUI) return;
    const user : User = {
      business_name: businessName,
      email: email,
      password: password
    }
    //DO API call

    const response: Promise<Response> = fetch('http://localhost:5000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    })

    //TODO: MySQL error when trying to register
    response.then((r) => {
      if(r.status == 201){
        setSuccess(true)
      } else {
        //400
        setErrorServer(true);
      }
    }).catch((e) => {
      //500
        setErrorServer(true);
    })


  }

  //Hooks
  useEffect(() => {
    setErrorMessageUI([]);
    checkForm(businessName,email,password,passwordConfirm);
  },[businessName,email,password,passwordConfirm]);

  


  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl my-2">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
            <span className="text-2xl font-bold text-white">🏢</span>
          </div>

          <h1 className="text-3xl font-bold text-blue-700">
            Create Account
          </h1>

          <p className="mt-2 text-gray-500">
            Register your business account
          </p>
        </div>

        <form className="space-y-5" onSubmit={(e) => submitForm(e)}>
          <div>
            <label
              htmlFor="business_name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Business Name
            </label>

            <input
              id="business_name"
              type="text"
              placeholder="Enter your business name"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Create a password"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="confirm_password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>

            <input
              id="confirm_password"
              type="password"
              placeholder="Confirm your password"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
          </div>

        {errorUI && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            <svg
            className="h-5 w-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
            </svg>
            
            {errorMessageUI?.map((err) => {
                return <>
                        <p className="text-sm font-medium">
                            {err}
                        </p>
                       </>
            })}
        </div>
        )}

        {errorServer && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            <svg
            className="h-5 w-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
            </svg>
            
            <p className="text-sm font-medium">Something went wrong, please try again.</p>
        </div>
        )}


        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">
            <svg
              className="h-5 w-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>

            <div>
              <p className="font-medium">Account created successfully!</p>
              <p className="text-sm text-green-600">
                You can now sign in using your email and password.
              </p>
            </div>
          </div>
        )}

          <button
            disabled={errorUI ? true : false}
            type="submit"
          className={`w-full rounded-lg py-3 font-semibold text-white transition active:scale-[0.98]
            ${
              errorUI
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 hover:cursor-pointer"
            }`}
          >
            Create Account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-700"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}