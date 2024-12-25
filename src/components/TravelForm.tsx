import { useForm } from "react-hook-form";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";

// Updated TravelPreferences interface to include `days` and `activities`
export interface TravelPreferences {
  destination: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  budget: string;
  interests: string;
  days: number;  // Added the days property
  activities: string[];  // Added the activities property
}

interface TravelFormProps {
  onSubmit: (preferences: TravelPreferences) => void;
}

export function TravelForm({ onSubmit }: TravelFormProps) {
  const form = useForm<TravelPreferences>({
    defaultValues: {
      destination: "",
      days: 1, // Set default to 1 day
      interests: "",
      budget: "",
    },
    // Add validation
    resolver: zodResolver(
      z.object({
        destination: z.string().min(1, "Destination is required"),
        days: z.number().min(1, "Minimum 1 day").max(30, "Maximum 30 days"),
        interests: z.string().min(1, "Interests are required"),
        budget: z.string().min(1, "Budget is required"),
      })
    ),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Destination Input */}
        <div className="space-y-2">
          <Label htmlFor="destination">Where do you want to go?</Label>
          <Input
            id="destination"
            placeholder="Enter destination"
            {...form.register("destination")}
            required
          />
        </div>

        <FormField
          control={form.control}
          name="days"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Days</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  max="30"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                How many days will you be traveling? (1-30 days)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Activities Input */}
        <div className="space-y-2">
          <Label htmlFor="activities">What activities do you want to include?</Label>
          <Input
            id="activities"
            placeholder="e.g., museum, hiking"
            {...form.register("activities")}
            required
          />
        </div>

        {/* Date Pickers */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !form.getValues("startDate") && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.getValues("startDate") ? (
                    format(form.getValues("startDate"), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={form.getValues("startDate")}
                  onSelect={(date) =>
                    form.setValue("startDate", date)
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !form.getValues("endDate") && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.getValues("endDate") ? (
                    format(form.getValues("endDate"), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={form.getValues("endDate")}
                  onSelect={(date) =>
                    form.setValue("endDate", date)
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Budget Input */}
        <div className="space-y-2">
          <Label htmlFor="budget">What's your budget?</Label>
          <Input
            id="budget"
            placeholder="Enter budget (e.g., 10000Rs)"
            {...form.register("budget")}
            required
          />
        </div>

        {/* Interests Input */}
        <div className="space-y-2">
          <Label htmlFor="interests">What are your interests?</Label>
          <Input
            id="interests"
            placeholder="e.g., hiking, food, culture"
            {...form.register("interests")}
            required
          />
        </div>

        <Button type="submit" className="w-full">
          Generate Itinerary
        </Button>
      </form>
    </Form>
  );
}
