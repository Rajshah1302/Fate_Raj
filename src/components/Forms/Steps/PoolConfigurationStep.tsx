/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormData } from "@/types/FormData";
import { ASSET_CONFIG } from "@/config/assets";
import { Coins } from "lucide-react";

type PoolConfigurationStepProps = {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  errors: { [key: string]: string };
};

const PoolConfigurationStep: React.FC<PoolConfigurationStepProps> = ({
  formData,
  updateFormData,
  errors,
}) => {
  return (
    <div className="space-y-4">
      {/* Pool Name */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
          <Label
            htmlFor="poolName"
            className="text-sm font-medium text-neutral-600 dark:text-neutral-400"
          >
            Name of the Fate Pool *
          </Label>
        </div>
        <Input
          type="text"
          id="poolName"
          name="poolName"
          placeholder="Enter descriptive name for your pool"
          value={formData.poolName}
          onChange={(e) => updateFormData({ poolName: e.target.value })}
          className={`transition-all focus:ring-2 focus:ring-black dark:focus:ring-white border-neutral-200 dark:border-neutral-700 text-black dark:text-white ${
            errors.poolName ? "border-red-500" : ""
          }`}
        />
        {errors.poolName && (
          <p className="text-red-500 text-sm">{errors.poolName}</p>
        )}
      </div>

      {/* Pool Description */}
      <div className="space-y-2">
        <Label
          htmlFor="poolDescription"
          className="text-sm font-medium text-neutral-600 dark:text-neutral-400"
        >
          Pool Description
        </Label>
        <Input
          type="text"
          id="poolDescription"
          name="poolDescription"
          placeholder="Enter a brief description of the pool (optional)"
          value={formData.poolDescription || ""}
          onChange={(e) => updateFormData({ poolDescription: e.target.value })}
          className="transition-all focus:ring-2 focus:ring-black dark:focus:ring-white border-neutral-200 dark:border-neutral-700 text-black dark:text-white"
        />
      </div>

      {/* Asset ID */}
      <div className="space-y-2">
        <Label
          htmlFor="assetId"
          className="text-sm font-medium text-neutral-600 dark:text-neutral-400"
        >
          Asset ID *
        </Label>
        <select
          id="assetId"
          name="assetId"
          value={formData.pairId ?? ""}
          onChange={(e) =>
            updateFormData({
              pairId: e.target.value,
              assetAddress: ASSET_CONFIG[e.target.value].coinId,
            })
          }
          className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 text-black dark:text-white bg-white dark:bg-neutral-800 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
        >
          <option value="" disabled>
            Select an Asset ID
          </option>
          {Object.entries(ASSET_CONFIG).map(([key, asset]: any) => (
            <option key={key} value={key}>
              {asset.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default PoolConfigurationStep;
