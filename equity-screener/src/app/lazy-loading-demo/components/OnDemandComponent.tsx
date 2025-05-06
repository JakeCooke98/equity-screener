import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'

export default function OnDemandComponent() {
  const [loadTime, setLoadTime] = useState<string>('')
  
  useEffect(() => {
    // Record when the component was loaded
    setLoadTime(new Date().toLocaleTimeString())
  }, [])
  
  return (
    <Card className="overflow-hidden bg-purple-50 border-purple-200">
      <CardContent className="p-4">
        <div className="font-medium text-purple-800">On-Demand Component Loaded!</div>
        <p className="mt-2 text-purple-700">
          This component was only loaded after you clicked the button.
          The JavaScript for this component wasn't included in the initial page load.
        </p>
        <div className="text-sm mt-4 font-mono text-purple-600">
          Loaded at: {loadTime}
        </div>
      </CardContent>
    </Card>
  )
} 