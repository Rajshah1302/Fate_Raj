"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoIcon, Percent } from "lucide-react";
import type { FormData } from "@/types/FormData";

interface FeeConfigurationStepProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  errors: { [key: string]: string };
}

const FeeConfigurationStep: React.FC<FeeConfigurationStepProps> = ({
  formData,
  updateFormData,
  errors,
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-black dark:text-white mb-2">
          Fee Configuration
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Configure fee structure for your pool
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Creator Stake Fee *
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-4 w-4 text-gray-600/70 dark:text-gray-400/70 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                  <p className="w-64 text-sm">
                    Percentage of stake fees allocated to the creator
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            type="number"
            placeholder="0"
            step="0.01"
            min="0"
            max="100"
            value={formData.creatorStakeFee}
            onChange={(e) =>
              updateFormData({ creatorStakeFee: e.target.value })
            }
            className={`transition-all focus:ring-2 focus:ring-black dark:focus:ring-white border-gray-200 dark:border-gray-700 text-black dark:text-white ${
              errors.creatorStakeFee ? "border-red-500" : ""
            }`}
          />
          {errors.creatorStakeFee && (
            <p className="text-red-500 text-sm">{errors.creatorStakeFee}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Creator Unstake Fee *
            </Label>
          </div>
          <Input
            type="number"
            placeholder="0"
            step="0.01"
            min="0"
            max="100"
            value={formData.creatorUnstakeFee}
            onChange={(e) =>
              updateFormData({ creatorUnstakeFee: e.target.value })
            }
            className={`transition-all focus:ring-2 focus:ring-black dark:focus:ring-white border-gray-200 dark:border-gray-700 text-black dark:text-white ${
              errors.creatorUnstakeFee ? "border-red-500" : ""
            }`}
          />
          {errors.creatorUnstakeFee && (
            <p className="text-red-500 text-sm">{errors.creatorUnstakeFee}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Stake Fee *
            </Label>
          </div>
          <Input
            type="number"
            placeholder="0"
            step="0.01"
            min="0"
            max="100"
            value={formData.stakeFee}
            onChange={(e) => updateFormData({ stakeFee: e.target.value })}
            className={`transition-all focus:ring-2 focus:ring-black dark:focus:ring-white border-gray-200 dark:border-gray-700 text-black dark:text-white ${
              errors.stakeFee ? "border-red-500" : ""
            }`}
          />
          {errors.stakeFee && (
            <p className="text-red-500 text-sm">{errors.stakeFee}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Unstake Fee *
            </Label>
          </div>
          <Input
            type="number"
            placeholder="0"
            step="0.01"
            min="0"
            max="100"
            value={formData.unstakeFee}
            onChange={(e) => updateFormData({ unstakeFee: e.target.value })}
            className={`transition-all focus:ring-2 focus:ring-black dark:focus:ring-white border-gray-200 dark:border-gray-700 text-black dark:text-white ${
              errors.unstakeFee ? "border-red-500" : ""
            }`}
          />
          {errors.unstakeFee && (
            <p className="text-red-500 text-sm">{errors.unstakeFee}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeeConfigurationStep;
