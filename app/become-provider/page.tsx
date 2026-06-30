"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  User, 
  Briefcase, 
  FileText, 
  CreditCard, 
  MapPin, 
  CheckCircle2, 
  Loader2, 
  Plus, 
  Trash2,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Award,
  Wallet
} from "lucide-react";

export default function BecomeProviderPage() {
  const router = useRouter();
  const { signup, authenticated, user } = useApp();
  
  // If already authenticated as provider, redirect
  useEffect(() => {
    if (authenticated && user) {
      if (user.role === "PROVIDER") {
        router.push("/provider/dashboard");
      }
    }
  }, [authenticated, user]);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [bankAccount, setBankAccount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  
  // Document Uploads (Mock Base64/URLs)
  const [aadhaarUrl, setAadhaarUrl] = useState("https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=400");
  const [selfieUrl, setSelfieUrl] = useState("https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200");

  // Service Areas list (Multiples)
  const [state, setState] = useState("Karnataka");
  const [district, setDistrict] = useState("Bengaluru Urban");
  const [city, setCity] = useState("Bengaluru");
  const [area, setArea] = useState("");
  const [pincode, setPincode] = useState("");
  const [serviceAreas, setServiceAreas] = useState<any[]>([
    { state: "Karnataka", district: "Bengaluru Urban", city: "Bengaluru", area: "Koramangala", pincode: "560034" }
  ]);

  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res: Response) => res.json())
      .then((data: any[]) => setCategories(data));
  }, []);

  const addServiceArea = () => {
    if (!area.trim() || !pincode.trim()) {
      alert("Please fill in both Area and Pincode fields.");
      return;
    }
    setServiceAreas([...serviceAreas, { state, district, city, area: area.trim(), pincode: pincode.trim() }]);
    setArea("");
    setPincode("");
  };

  const removeServiceArea = (idx: number) => {
    setServiceAreas(serviceAreas.filter((_: any, i: number) => i !== idx));
  };

  const toggleSkill = (skillName: string) => {
    if (skills.includes(skillName)) {
      setSkills(skills.filter((s: string) => s !== skillName));
    } else {
      setSkills([...skills, skillName]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (serviceAreas.length === 0) {
      alert("You must define at least one Service Coverage Area.");
      return;
    }
    if (skills.length === 0) {
      alert("Please select at least one skill category.");
      return;
    }

    try {
      setLoading(true);
      const signupData = {
        email,
        password,
        name,
        role: "PROVIDER",
        mobileNumber,
        bio,
        experience,
        skills,
        bankAccount,
        upiId,
        gstNumber,
        aadhaarUrl,
        selfieUrl,
        serviceAreas
      };

      const res = await signup(signupData);
      if (res.success) {
        router.push("/provider/dashboard");
      } else {
        alert(res.error || "Registration failed. Check details and try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Internal Server Error occurred during sign up.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow bg-background py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">Become a Service Partner</h1>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Join India's most secure services platform. Get daily jobs in your local pincode, withdraw earnings daily, and receive the verified provider badge.
            </p>
          </div>

          {/* Stepper Progress bar */}
          <div className="bg-card border border-border rounded-2xl p-4 flex justify-between items-center text-xs font-bold text-muted-foreground shadow-sm">
            <span className={step === 1 ? "text-primary font-black" : ""}>1. Personal</span>
            <ChevronRight className="h-4 w-4" />
            <span className={step === 2 ? "text-primary font-black" : ""}>2. Skills</span>
            <ChevronRight className="h-4 w-4" />
            <span className={step === 3 ? "text-primary font-black" : ""}>3. Credentials</span>
            <ChevronRight className="h-4 w-4" />
            <span className={step === 4 ? "text-primary font-black" : ""}>4. Financials</span>
            <ChevronRight className="h-4 w-4" />
            <span className={step === 5 ? "text-primary font-black" : ""}>5. Service Areas</span>
          </div>

          {/* Registration Form Box */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-md">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* STEP 1: PERSONAL DETAILS */}
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Step 1: Contact Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-3xs font-semibold uppercase text-muted-foreground">Full Name (As in Aadhaar)</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Enter full name" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-3xs font-semibold uppercase text-muted-foreground">Mobile Number</label>
                      <input 
                        type="tel" 
                        required 
                        placeholder="10-digit phone number" 
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-3xs font-semibold uppercase text-muted-foreground">Email Address</label>
                      <input 
                        type="email" 
                        required 
                        placeholder="name@email.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-3xs font-semibold uppercase text-muted-foreground">Choose Password</label>
                      <input 
                        type="password" 
                        required 
                        placeholder="Minimum 6 characters" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <button 
                      type="button" 
                      onClick={() => setStep(2)}
                      className="rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground px-5 py-2 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      Next Step <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: SKILLS & EXPERIENCE */}
              {step === 2 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    Step 2: Skills & Experience
                  </h3>
                  
                  <div className="space-y-1">
                    <label className="block text-3xs font-semibold uppercase text-muted-foreground">Years of Experience</label>
                    <input 
                      type="number" 
                      required 
                      placeholder="E.g. 5" 
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 max-w-[200px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-3xs font-semibold uppercase text-muted-foreground">Select Skill Categories (Choose one or more)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {categories.map((cat: any) => {
                        const isSelected = skills.includes(cat.name);
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => toggleSkill(cat.name)}
                            className={`px-3 py-2.5 rounded-lg border text-left text-xs font-bold transition-all cursor-pointer ${
                              isSelected 
                                ? "bg-primary/10 border-primary text-primary" 
                                : "bg-background border-border text-muted-foreground hover:border-foreground"
                            }`}
                          >
                            {cat.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-3xs font-semibold uppercase text-muted-foreground">Professional Summary / Bio</label>
                    <textarea 
                      rows={3} 
                      required
                      placeholder="Tell customers about your expertise, background, or training..." 
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="flex justify-between pt-4 border-t border-border">
                    <button 
                      type="button" 
                      onClick={() => setStep(1)}
                      className="rounded-lg border border-border px-4 py-2 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4" /> Back
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setStep(3)}
                      className="rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground px-5 py-2 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      Next Step <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: DOCUMENT UPLOAD */}
              {step === 3 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Step 3: Document Verification (Mock uploads)
                  </h3>
                  
                  <p className="text-3xs text-muted-foreground">
                    To comply with security audits, we require government ID documentation. Standard verified badges are granted upon approval.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Aadhaar */}
                    <div className="border border-dashed border-border rounded-2xl p-5 text-center space-y-3 bg-background">
                      <p className="text-2xs font-bold text-foreground">Government ID (Aadhaar Card)</p>
                      <img src={aadhaarUrl} alt="Aadhaar ID Mock" className="h-20 w-auto object-contain mx-auto rounded border border-border" />
                      <button 
                        type="button" 
                        onClick={() => alert("Mock Aadhaar uploaded successfully.")}
                        className="rounded-lg border border-border bg-card px-3 py-1.5 text-3xs font-semibold inline-flex items-center gap-1 cursor-pointer hover:border-primary"
                      >
                        <Plus className="h-3.5 w-3.5" /> Reupload ID
                      </button>
                    </div>

                    {/* Selfie */}
                    <div className="border border-dashed border-border rounded-2xl p-5 text-center space-y-3 bg-background">
                      <p className="text-2xs font-bold text-foreground">Selfie Portrait Photograph</p>
                      <img src={selfieUrl} alt="Selfie Mock" className="h-20 w-20 object-cover mx-auto rounded-full border border-border" />
                      <button 
                        type="button" 
                        onClick={() => alert("Mock Selfie photo uploaded successfully.")}
                        className="rounded-lg border border-border bg-card px-3 py-1.5 text-3xs font-semibold inline-flex items-center gap-1 cursor-pointer hover:border-primary"
                      >
                        <Plus className="h-3.5 w-3.5" /> Reupload Selfie
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-border">
                    <button 
                      type="button" 
                      onClick={() => setStep(2)}
                      className="rounded-lg border border-border px-4 py-2 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4" /> Back
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setStep(4)}
                      className="rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground px-5 py-2 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      Next Step <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: FINANCIAL DETAILS */}
              {step === 4 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Step 4: Billing & Financials
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-3xs font-semibold uppercase text-muted-foreground">Bank Account Details (Account No. & IFSC)</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="E.g. 123456789012 SBIN0001234" 
                        value={bankAccount}
                        onChange={(e) => setBankAccount(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-3xs font-semibold uppercase text-muted-foreground">UPI ID (For Daily Settlements)</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="username@upi" 
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-1 col-span-1 sm:col-span-2">
                      <label className="block text-3xs font-semibold uppercase text-muted-foreground">GST Registration Number (Optional)</label>
                      <input 
                        type="text" 
                        placeholder="Enter GSTIN if registered" 
                        value={gstNumber}
                        onChange={(e) => setGstNumber(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-border">
                    <button 
                      type="button" 
                      onClick={() => setStep(3)}
                      className="rounded-lg border border-border px-4 py-2 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4" /> Back
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setStep(5)}
                      className="rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground px-5 py-2 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      Next Step <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: SERVICE COVERAGE AREAS */}
              {step === 5 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Step 5: Define Service Coverage Areas
                  </h3>

                  <p className="text-3xs text-muted-foreground">
                    Customers will only find you if their input pincode matches one of your registered coverage areas. Add all areas you can cover.
                  </p>

                  <div className="bg-background rounded-2xl border border-border p-4 space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="space-y-1">
                        <label className="block text-4xs font-bold uppercase text-muted-foreground">State</label>
                        <select 
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className="w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-3xs font-semibold focus:outline-none"
                        >
                          <option value="Karnataka">Karnataka</option>
                          <option value="Maharashtra">Maharashtra</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-4xs font-bold uppercase text-muted-foreground">City</label>
                        <input 
                          type="text" 
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full rounded-lg border border-border bg-card px-2.5 py-1 text-3xs font-semibold focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-4xs font-bold uppercase text-muted-foreground">Area Name</label>
                        <input 
                          type="text" 
                          placeholder="E.g. Koramangala" 
                          value={area}
                          onChange={(e) => setArea(e.target.value)}
                          className="w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-3xs font-semibold focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-4xs font-bold uppercase text-muted-foreground">Pincode</label>
                        <input 
                          type="text" 
                          placeholder="6-digit PIN" 
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                          className="w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-3xs font-semibold focus:outline-none"
                        />
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={addServiceArea}
                      className="rounded-lg bg-secondary text-primary hover:bg-primary/10 px-3.5 py-1.5 text-3xs font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" /> Add Pincode to List
                    </button>
                  </div>

                  {/* Active coverage areas table */}
                  <div className="space-y-2">
                    <p className="text-3xs font-bold uppercase text-muted-foreground">Covered Pincode List ({serviceAreas.length})</p>
                    {serviceAreas.length > 0 ? (
                      <div className="border border-border rounded-xl overflow-hidden text-xs bg-background">
                        <table className="w-full text-left">
                          <thead className="bg-secondary text-muted-foreground text-4xs uppercase font-bold border-b border-border">
                            <tr>
                              <th className="px-4 py-2">City</th>
                              <th className="px-4 py-2">Area</th>
                              <th className="px-4 py-2">Pincode</th>
                              <th className="px-4 py-2 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {serviceAreas.map((sa: any, idx: number) => (
                              <tr key={idx} className="border-b border-border last:border-0">
                                <td className="px-4 py-2 font-medium">{sa.city}</td>
                                <td className="px-4 py-2">{sa.area}</td>
                                <td className="px-4 py-2 font-bold">{sa.pincode}</td>
                                <td className="px-4 py-2 text-right">
                                  <button 
                                    type="button" 
                                    onClick={() => removeServiceArea(idx)}
                                    className="text-destructive hover:text-destructive/80"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-3xs text-amber-500 font-semibold border border-amber-500/10 bg-amber-500/5 p-3 rounded-lg">
                        You have not registered any pincodes yet. Customers will not be able to search for you.
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between pt-4 border-t border-border">
                    <button 
                      type="button" 
                      onClick={() => setStep(4)}
                      className="rounded-lg border border-border px-4 py-2 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4" /> Back
                    </button>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Submitting Registration...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Complete Registration
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
