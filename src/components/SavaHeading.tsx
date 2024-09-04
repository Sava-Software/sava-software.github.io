import SavaLogo from "../assets/sava_logo.png"
import { Button } from "@/components/ui/button"

export default function Component() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="w-full md:w-1/3">
          <img
            src={SavaLogo} 
            alt="Sava Logo"
            width={200}
            height={200}
            className="mx-auto"
          />
        </div>
        <div className="w-full md:w-2/3 text-center md:text-left">
          <h1 className="text-4xl font-bold mb-4">Welcome to Our Platform</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Discover amazing features and boost your productivity with our innovative solutions.
          </p>
          <div className="space-x-4">
            <Button>Get Started</Button>
            <Button variant="outline">Learn More</Button>
          </div>
        </div>
      </div>
    </div>
  )
}