import DefaultLayout from "@/layouts/default";
import { title } from "@/components/primitives";
import React from "react";
import { Card, CardHeader, Spacer, Input, Button, Divider } from "@nextui-org/react";

export default function DashboardPage() {
  return (
    <DefaultLayout>
      <h1 className={`${title()} text-green-500 pb-2`}>
        Dashboard
      </h1>
      <Spacer y={12} />
      <div className="w-full gap-2 grid grid-cols-12  px-8">
        <Card isBlurred className="w-full h-[200px] col-span-12 sm:col-span-12 relative flex justify-center items-center">
          <CardHeader className="absolute z-10 top-1 flex-col items-start">
            <h4 className="text-white/90 font-medium text-3xl">Lottery Numbers</h4>
          </CardHeader>
          <p className="text-green-500 p-8 font-bold">  Enter random numbers
            between 1 - 49 </p>
          <div className="w-full gap-2 grid grid-cols-6  px-8">
            <Input
              type="number"
              label=""
              placeholder="0"
            />
            <Input
              type="number"
              label=""
              placeholder="0"
              startContent={
                <div className="pointer-events-none flex items-center">
                </div>
              }
            />
            <Input
              type="number"
              label=""
              placeholder="0"
              startContent={
                <div className="pointer-events-none flex items-center">
                </div>
              }
            />
            <Input
              type="number"
              label=""
              placeholder="0"
              startContent={
                <div className="pointer-events-none flex items-center">
                </div>
              }
            />
            <Input
              type="number"
              label=""
              placeholder="0"
              startContent={
                <div className="pointer-events-none flex items-center">
                </div>
              }
            />
            <Input
              type="number"
              label=""
              placeholder="0"
              startContent={
                <div className="pointer-events-none flex items-center">
                </div>
              }
            />
          </div>
        </Card>
      </div>
      <div className="flex justify-center mt-6">
            <Button radius="full" color="success" className="text-black shadow-xl w-48 h-12 ml-4">
              Submit
            </Button>
      </div>
      <Spacer y={12} />
      <Divider />
      <Spacer y={12} />
      <div className="w-full gap-2 grid grid-cols-12  px-8">
        <Card isBlurred className="w-full h-[200px] col-span-12 sm:col-span-12 relative flex justify-center items-center">
          <CardHeader className="absolute z-10 top-1 flex-col items-start">
            <h4 className="text-white/90 font-medium text-3xl">Claim Winnigs</h4>
          </CardHeader>
          <div className="w-full gap-2 grid grid-cols-1  px-8">
            <Input
              type="number"
              label="Enter Week ID"
              placeholder="0"
            />
          </div>
        </Card>
      </div>
      <div className="flex justify-center mt-6">
            <Button radius="full" color="success" className="text-black shadow-xl w-48 h-12 ml-4">
              Claim
            </Button>
      </div>
    </DefaultLayout>
  );
}
