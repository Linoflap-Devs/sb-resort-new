"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardHeader } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Tiptap from "@/components/Tiptap";
import { useRouter } from "next/navigation";
import SelectComponent from "@/components/SelectComponent";
import { useGlobalStore } from "@/store/useGlobalStore";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  addRoomType,
  deleteRoomType,
  editRoomType,
  getAmenities,
  getEditValues,
  getRoomAmenities,
} from "@/app/ServerAction/rooms.action";
import { toast } from "sonner";
import { useTranslation } from "next-export-i18n";
import { Loader2, XIcon } from "lucide-react";
import { convertMBtoBytes } from "@/utils/Helpers";
import { useEffect, useState } from "react";
import { imageConfigDefault } from "next/dist/shared/lib/image-config";
import { data } from "autoprefixer";
import { B } from "million/dist/shared/million.50256fe7";
import { createClient } from "@supabase/supabase-js";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUploadObject, RoomAmenity } from "@/types";

export default function RoomTypeForm({ id }: { id?: string | undefined }) {
  const { t } = useTranslation();
  const roomsI18n = t("RoomsPage");
  const generalI18n = t("general");
  const { bedTypeOptionsQuery, imageUploadMaxMB } = useGlobalStore();
  const { data: bedTypeOptions, isLoading: bedLoading } = bedTypeOptionsQuery();
  const [imgObjArray, setImgObjArray] = useState<ImageUploadObject[]>(
    [] as ImageUploadObject[],
  );
  const [imgUploadCount, setImgUploadCount] = useState(0);
  const [imgUp, setImgUp] = useState<File>({} as File);
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);
  const [amenitySearch, setAmenitySearch] = useState<string>("");

  const router = useRouter();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  );

  const { data: editValues, isLoading } = useQuery({
    enabled: !bedLoading,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    queryKey: ["getEditValues", id],
    queryFn: async () => {
      const res = await getEditValues(id);
      if (!res?.success) {
        throw new Error(res?.error);
      }
      ``;
      return res.res?.[0];
    },
  });

  const { data: amenities, isLoading: amenitiesLoading } = useQuery({
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    queryKey: ["GetAmenities"],
    queryFn: async () => {
      return (await getAmenities()).res as RoomAmenity[];
    },
  });

  async function uploadImage(file: File) {
    let path = `${file.name}`;

    const { data, error } = await supabase.storage
      .from("images")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.log(error);
    }

    const { data: publicUrl } = await supabase.storage
      .from("images")
      .getPublicUrl(path);

    return publicUrl;
  }

  const toggleAmenity = (id: number) => {
    if (selectedAmenities.includes(id)) {
      setSelectedAmenities(
        selectedAmenities.filter((amenity) => amenity !== id),
      );
    } else {
      setSelectedAmenities([...selectedAmenities, id]);
    }
  };

  const filteredAmenities = amenities?.filter((amenity) => {
    return (
      amenity.Label.toLowerCase().includes(amenitySearch.toLowerCase()) ||
      amenity.Description.toLowerCase().includes(amenitySearch.toLowerCase())
    );
  });

  const formSchema = z.object({
    /* Room Details */
    roomTypeName: z.string().min(1, { message: "Required" }),
    adultCount: z.string().min(1, { message: "Required" }),
    childCount: z.string().min(1, { message: "Required" }),
    bedType: z.string().min(1, { message: "Required" }),
    /* Weekend Rate */
    baseRoomRate: z.string().min(1, { message: "Required" }),
    extraChildWeekEndRate: z.string().min(1, { message: "Required" }),
    extraAdultWeekEndRate: z.string().min(1, { message: "Required" }),
    /* Weekday Rate */
    weekendRoomRate: z.string().min(1, { message: "Required" }),
    extraChildWeekDayRate: z.string().min(1, { message: "Required" }),
    extraAdultWeekDayRate: z.string().min(1, { message: "Required" }),
    /* Descrption */
    description: z.string().min(1, { message: "Required" }),
    image_urls: z.array(z.string().url().optional()),
    amenities: z.array(z.number().optional()),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    mode: "onChange",
    resolver: zodResolver(formSchema),
    values: {
      roomTypeName: id ? editValues?.RoomType : "",
      adultCount: id ? editValues?.MaxAdult.toString() : "",
      childCount: id ? editValues?.MaxChild.toString() : "",
      bedType: id ? editValues?.BedTypeId.toString() || "" : "",
      /* ============ */
      weekendRoomRate: id ? editValues?.WeekendRoomRate.toString() : "",
      extraChildWeekEndRate: id
        ? editValues?.WeekendExtraChildRate.toString()
        : "",
      extraAdultWeekEndRate: id
        ? editValues?.WeekendExtraAdultRate.toString()
        : "",
      /* ------------ */
      baseRoomRate: id ? editValues?.BaseRoomRate.toString() : "",
      extraChildWeekDayRate: id ? editValues?.ExtraChildRate.toString() : "",
      extraAdultWeekDayRate: id ? editValues?.ExtraAdultRate.toString() : "",
      description: id ? editValues?.Description.toString() : defaultDescription,
      image_urls: id ? editValues?.Images || [] : [],
      amenities: id ? editValues?.Amenities || [] : [],
    },
  });

  useEffect(() => {
    console.log("trigger");
    if (editValues && bedTypeOptions) {
      form.reset({
        roomTypeName: editValues.RoomType,
        adultCount: editValues.MaxAdult.toString(),
        childCount: editValues.MaxChild.toString(),
        bedType: editValues.BedTypeId.toString(),
        weekendRoomRate: editValues.WeekendRoomRate.toString(),
        extraChildWeekEndRate: editValues.WeekendExtraChildRate.toString(),
        extraAdultWeekEndRate: editValues.WeekendExtraAdultRate.toString(),
        baseRoomRate: editValues.BaseRoomRate.toString(),
        extraChildWeekDayRate: editValues.ExtraChildRate.toString(),
        extraAdultWeekDayRate: editValues.ExtraAdultRate.toString(),
        description: editValues.Description.toString() || defaultDescription,
        image_urls: editValues.Images || [],
        amenities: editValues.Amenities || [],
      });
    }
    console.log(amenities, selectedAmenities);
    console.log(editValues);
  }, [editValues, bedTypeOptions, form]);

  console.log(editValues?.BedTypeId.toString());
  console.log(form.getValues("bedType"));

  const addMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await addRoomType(data);
      if (!res.success) {
        throw new Error(res.error);
      }
      return res;
    },
    onSuccess: () => {
      toast.success("Room Type Added", {
        description: "Room Type Added Successfully",
      });
      router.push("/rooms/viewroomtypes");
    },
    onError: (error) => {
      console.log(error);
      toast.error("Adding Room Type Failed"),
        {
          description:
            "There was an error adding the Room Type. Please try again later.",
        };
    },
  });
  const editMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await editRoomType({
        ...data,
      });
      if (!res.success) {
        throw new Error(res.error);
      }
      return res;
    },
    onSuccess: () => {
      toast.success("Room Type Edited", {
        description: "Room Type Edited Successfully",
      });
      router.push("/rooms/viewroomtypes");
    },
    onError: (error) => {
      toast.error("Editing Room Type Failed"),
        {
          description:
            "There was an error editing the Room Type. Please try again later.",
        };
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Validation
    const sizeError = imgObjArray?.some(
      (img: ImageUploadObject) => img.isSizeExceeded,
    );

    if (sizeError) {
      console.log("size check");
      toast.error(`One or more images exceed ${imageUploadMaxMB} MB.`);
      return;
    }

    const sonner = toast.loading("Uploading Images...");
    toast.loading("Uploading Images...", {
      id: sonner,
      duration: Infinity,
    });

    const supabaseUrls = await Promise.all(
      imgObjArray.map(async (img: ImageUploadObject) => {
        if (img.url.includes("blob:") || img.url.includes("localhost")) {
          console.log(img);
          const publicUrl = await uploadImage(img.file as File);
          console.log(publicUrl);
          setImgUploadCount((prev) => prev + 1);
          toast.loading(
            `Uploaded ${imgUploadCount} ${imgUploadCount > 1 ? "images" : "image"}`,
            {
              id: sonner,
              duration: Infinity,
            },
          );
          if (publicUrl) {
            return publicUrl?.publicUrl;
          }
        }
        return img.url;
      }),
    );

    values.image_urls = supabaseUrls;
    console.log(values);

    if (id) {
      if (values.amenities != selectedAmenities) {
      }

      editMutation.mutate({
        ...values,
        RateTypeId: editValues?.RateTypeId,
        RoomRateId: editValues?.RoomRateID,
        RoomTypeId: editValues?.RoomTypeId,
        amenitiesOld: selectedAmenities,
      });
    } else {
      addMutation.mutate(values);
    }

    toast.success("Room Type added successfully");
    setTimeout(() => {
      toast.dismiss();
    }, 3000);
  }

  useEffect(() => {
    if (editValues?.Images) {
      const existingImgs = editValues.Images.map((url: string) => ({
        url: url,
        name: url.split("/").pop(),
        size: -1,
        isSizeExceeded: false,
        file: null,
      }));

      setImgObjArray(existingImgs);
    }
  }, [editValues]);

  useEffect(() => {
    if (editValues?.Amenities.length > 0) {
      setSelectedAmenities(editValues.Amenities);
    }
  }, [editValues]);

  // useEffect(() => {
  //   console.log("useeffect trigger")
  //   if (id && editValues) {
  //     form.reset({
  //       roomTypeName: editValues.RoomType,
  //       adultCount: editValues.MaxAdult.toString(),
  //       childCount: editValues.MaxChild.toString(),
  //       bedType: editValues.BedTypeId?.toString() || "3",  // Ensure bedType is updated properly here
  //       weekendRoomRate: editValues.WeekendRoomRate?.toString(),
  //       extraChildWeekEndRate: editValues.WeekendExtraChildRate?.toString(),
  //       extraAdultWeekEndRate: editValues.WeekendExtraAdultRate?.toString(),
  //       baseRoomRate: editValues.BaseRoomRate?.toString(),
  //       extraChildWeekDayRate: editValues.ExtraChildRate?.toString(),
  //       extraAdultWeekDayRate: editValues.ExtraAdultRate?.toString(),
  //       description: editValues.Description || defaultDescription,
  //       image_urls: editValues.Images || [],
  //     });
  //   }
  // }, [editValues, id, form])

  if (isLoading || bedLoading) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-4">
        <div className="flex w-full justify-center">
          <Loader2 size={40} className="animate-spin" />
        </div>
        <p>Loading Form...</p>
      </div>
    );
  }
  return (
    <div className="w-full p-4">
      {/* {
        editValues ? (
          editValues.Images.map((image: any) => {
            return <img src={image} className="w-full h-[200px] object-contain" />
          })          
        ) : (
          null
        )
      } */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="mb-4 flex justify-between">
            <p className="text-2xl font-semibold text-cstm-secondary">
              {id && editValues
                ? `Editing Room Type ${editValues?.RoomType}`
                : "New Room Type"}
            </p>
            <div className="flex gap-4">
              <Button
                className="border-2 border-cstm-secondary bg-transparent text-cstm-secondary"
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/rooms/viewroomtypes");
                }}
              >
                {generalI18n.cancel}
              </Button>
              <Button className="bg-cstm-secondary" type="submit">
                {id && editValues ? generalI18n.update : roomsI18n.addRoomType}
              </Button>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex w-1/2 flex-col gap-4">
              <Card className="bg-cstm-secondary">
                <CardHeader
                  className="flex rounded-t-md bg-cstm-primary p-3 pl-5 text-xl font-semibold text-white"
                  onClick={() => console.log(form.formState.errors)}
                >
                  {roomsI18n.roomDetails}
                </CardHeader>
                <div className="flex space-x-4 p-4">
                  <div className="w-1/2 space-y-1">
                    <FormField
                      control={form.control}
                      name="roomTypeName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">
                            {roomsI18n.typeName}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <div>
                            <FormControl>
                              <Input
                                placeholder={roomsI18n.enterTypeName}
                                {...field}
                              />
                            </FormControl>
                            <div className="h-4">
                              <FormMessage />
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="adultCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">
                            {roomsI18n.maxAdults}{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <div>
                            <FormControl>
                              <Input
                                placeholder={roomsI18n.enterMaxAdults}
                                type="number"
                                {...field}
                              />
                            </FormControl>
                            <div className="h-4">
                              <FormMessage />
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="w-1/2 space-y-1">
                    <FormField
                      control={form.control}
                      name="childCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">
                            {roomsI18n.maxChildren}{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <div>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder={roomsI18n.enterMaxChildren}
                                {...field}
                              />
                            </FormControl>
                            <div className="h-4">
                              <FormMessage />
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bedType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">
                            {roomsI18n.bedType}{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <div>
                            <FormControl>
                              <SelectComponent
                                className="w-full"
                                setState={field.onChange}
                                state={field.value}
                                options={bedTypeOptions || []}
                                placeholder={roomsI18n.selectBedType}
                              />
                            </FormControl>
                            <div className="h-4">
                              <FormMessage />
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </Card>
              <Card className="bg-cstm-secondary">
                <CardHeader className="flex rounded-t-md bg-cstm-primary p-3 pl-5 text-xl font-semibold text-white">
                  {roomsI18n.roomRate}
                </CardHeader>
                <div className="flex space-x-4 p-4 pt-2">
                  <div className="w-1/2">
                    <h1 className="text-lg font-semibold text-white">
                      {`${roomsI18n.weekendRate} (${roomsI18n.saturdayToSunday})`}
                    </h1>
                    <FormField
                      control={form.control}
                      name="weekendRoomRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">
                            {roomsI18n.weekendRate}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <div>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <div className="h-4">
                              <FormMessage />
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="extraChildWeekEndRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">
                            {roomsI18n.extraChildRate}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <div>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <div className="h-4">
                              <FormMessage />
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="extraAdultWeekEndRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">
                            {roomsI18n.extraAdultRate}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <div>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <div className="h-4">
                              <FormMessage />
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="w-1/2">
                    <h1 className="text-lg font-semibold text-white">
                      {roomsI18n.weekdayRate} ({roomsI18n.mondayToFriday})
                    </h1>
                    <FormField
                      control={form.control}
                      name="baseRoomRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">
                            {roomsI18n.weekdayRate}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <div>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <div className="h-4">
                              <FormMessage />
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="extraChildWeekDayRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">
                            {roomsI18n.extraChildRate}{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <div>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <div className="h-4">
                              <FormMessage />
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="extraAdultWeekDayRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">
                            {roomsI18n.extraAdultRate}{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <div>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <div className="h-4">
                              <FormMessage />
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </Card>

              <Card className="bg-cstm-secondary">
                <CardHeader className="rounded-t-md bg-cstm-primary p-3 pl-5 text-xl font-semibold text-white">
                  {generalI18n.description}
                </CardHeader>
                <div className="p-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <div>
                          <FormControl>
                            <Tiptap
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Room description..."
                            />
                          </FormControl>
                          <div className="h-4">
                            <FormMessage />
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </Card>
            </div>
            <div className="flex w-1/2 flex-col gap-4">
              <Card className="bg-cstm-secondary">
                <CardHeader className="rounded-t-md bg-cstm-primary p-3 pl-5 text-xl font-semibold text-white">
                  Room Images
                </CardHeader>
                <div className="p-t-0 p-4">
                  <FormField
                    control={form.control}
                    name="image_urls"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">
                          Upload Images
                        </FormLabel>
                        <div>
                          <FormControl>
                            <Input
                              className="text-lg"
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => {
                                const fileArray = Array.from(
                                  e.target.files as FileList,
                                );
                                const imgArray = Array.from(
                                  e.target.files as FileList,
                                ).map((file) => {
                                  return {
                                    name: file.name,
                                    size: file.size,
                                    file: file,
                                    url: URL.createObjectURL(file),
                                    isSizeExceeded:
                                      file.size >
                                      convertMBtoBytes(imageUploadMaxMB),
                                  };
                                });
                                const urls = fileArray.map((file) =>
                                  URL.createObjectURL(file),
                                );
                                console.log(field);
                                setImgObjArray((prev: any) => [
                                  ...prev,
                                  ...imgArray,
                                ]);
                                field.onChange([
                                  ...(field.value || []),
                                  ...urls,
                                ]);
                                console.log(field);
                              }}
                            />
                            {/* <Input 
                              className="w-60"
                              name="imageUploader"
                              type="file"
                              onChange={(e) => {
                                setImgUp(e.target.files![0])
                                console.log(e.target.files)
                              }} 
                            ></Input> */}
                          </FormControl>
                          {field.value.length > 0 && (
                            <>
                              <p className="mt-4 text-sm text-white">
                                Image Previews
                              </p>
                              <div className="mt-4 flex flex-col flex-wrap gap-4">
                                {/* {field.value?.map((url, index) => (
                                  <div className="relative rounded">
                                    <img
                                      key={index}
                                      src={url}
                                      className="h-40 w-40 object-cover rounded"
                                    />
                                    <Button 
                                      type="button"
                                      className="absolute top-2 right-2 bg-red-800 rounded-full flex items-center justify-center"
                                      onClick={() => {
                                        const updatedImgs = field.value.filter((_, i) => i !== index)
                                        setImgObjArray(imgObjArray.filter((_: any, i: number) => i !== index))
                                        field.onChange(updatedImgs)
                                      }}
                                    >
                                      <XIcon color="white" size={12}></XIcon>
                                    </Button>
                                  </div>
                                ))} */}

                                {imgObjArray?.length == 0 &&
                                id &&
                                editValues?.Images ? (
                                  <Skeleton className="w-full p-4">
                                    <Skeleton className="h-16 w-16"></Skeleton>
                                  </Skeleton>
                                ) : (
                                  imgObjArray?.map(
                                    (obj: any, index: number) => (
                                      <div
                                        className={`relative flex w-full gap-4 rounded bg-cstm-primary p-4 ${obj.isSizeExceeded ? "border-2 border-red-500" : "border-white-200 border-2"}`}
                                      >
                                        <img
                                          key={index}
                                          src={obj.url}
                                          className="h-16 w-16 rounded object-cover"
                                        />
                                        {/* <Button 
                                         type="button"
                                         className="absolute top-2 right-2 bg-red-800 rounded-full flex items-center justify-center"
                                         onClick={() => {
                                           const updatedImgs = field.value.filter((_, i) => i !== index)
                                           setImgObjArray(imgObjArray.filter((_: any, i: number) => i !== index))
                                           field.onChange(updatedImgs)
                                           console.log(field)
                                         }}
                                       >
                                         <XIcon color="white" size={12}></XIcon>
                                       </Button> */}
                                        <div className="flex w-full justify-between">
                                          <div className="w-full flex-col">
                                            <p className="overflow-hidden truncate text-wrap font-bold">
                                              {obj.name}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-2">
                                              {obj.size > 0 && (
                                                <p className="text-black/[.70]">
                                                  {obj.size / 1024 / 1024 < 1
                                                    ? Math.ceil(
                                                        obj.size / 1024,
                                                      ) + "KB"
                                                    : (
                                                        obj.size /
                                                        1024 /
                                                        1024
                                                      ).toFixed(1) + "MB"}
                                                </p>
                                              )}
                                              {obj.isSizeExceeded && (
                                                <p className="text-sm text-red-700">
                                                  Image size exceeds the maximum
                                                  limit of {imageUploadMaxMB}{" "}
                                                  MB.
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                          <div className="flex h-full flex-col justify-center">
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              onClick={() => {
                                                const updatedImgs =
                                                  field.value.filter(
                                                    (_, i) => i !== index,
                                                  );
                                                const updatedImgArray =
                                                  imgObjArray.filter(
                                                    (_: any, i: number) =>
                                                      i !== index,
                                                  );
                                                console.log(updatedImgs);
                                                setImgObjArray(updatedImgArray);
                                                console.log(field);
                                                field.onChange(updatedImgs);
                                                console.log(field);
                                              }}
                                            >
                                              <XIcon
                                                color="currentColor"
                                                size={16}
                                              ></XIcon>
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    ),
                                  )
                                )}
                              </div>
                              {/* <div className="text-white">
                                {field.value.map((url, index) => (
                                  <p>{`${index}. ${url}`}</p>
                                ))}
                              </div> */}
                            </>
                          )}
                          <div className="h-4">
                            <FormMessage />
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </Card>
              <Card className="bg-cstm-secondary">
                <CardHeader className="rounded-t-md bg-cstm-primary p-3 pl-5 text-xl font-semibold text-white">
                  Amenities
                </CardHeader>
                <FormField
                  control={form.control}
                  name="amenities"
                  render={({ field }) => {
                    // Compute all filtered IDs and whether all are selected.
                    const allFilteredIds =
                      filteredAmenities?.map((amenity: any) => amenity.Id) ||
                      [];
                    const isAllSelected =
                      filteredAmenities &&
                      filteredAmenities.length > 0 &&
                      allFilteredIds.every((id) => field.value.includes(id));

                    return (
                      <FormItem>
                        {field.value.length > 0 && (
                          <div className="flex flex-col gap-4 p-4">
                            <p className="font-bold text-white">
                              Selected Amenities ({field.value.length})
                            </p>
                            <div className="flex flex-wrap gap-4">
                              {field.value?.map((selectedId: any) => {
                                let amenity = amenities?.find(
                                  (item: any) => item.Id === selectedId,
                                );
                                return (
                                  amenity && (
                                    <div
                                      className="flex items-center gap-4 rounded bg-cstm-primary p-2"
                                      tabIndex={0}
                                      role="button"
                                      key={amenity.Id}
                                      onClick={() => {
                                        const newValue = field.value.filter(
                                          (id) => id !== selectedId,
                                        );
                                        field.onChange(newValue);
                                      }}
                                    >
                                      <p className="text-sm text-white">
                                        {amenity.Label}
                                      </p>
                                      <XIcon size={12} color="white" />
                                    </div>
                                  )
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div className="p-4">
                          <Input
                            placeholder="Search for amenities..."
                            value={amenitySearch}
                            onChange={(e) => setAmenitySearch(e.target.value)}
                          />
                          <hr className="mt-4 border-white/[.20]" />
                        </div>

                        <div className="flex items-center px-4 py-2">
                          <Checkbox
                            checked={isAllSelected}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                // Add all filtered amenity IDs, preserving any existing selections
                                const newValue = Array.from(
                                  new Set([...field.value, ...allFilteredIds]),
                                );
                                field.onChange(newValue);
                              } else {
                                // Remove filtered amenity IDs from the current selection
                                const newValue = field.value.filter(
                                  (id) => !allFilteredIds.includes(id),
                                );
                                field.onChange(newValue);
                              }
                            }}
                            className="h-5 w-5 rounded border-0 border-cstm-primary transition transition-all data-[state=checked]:bg-white data-[state=unchecked]:bg-white data-[state=checked]:text-cstm-primary"
                          />
                          <p className="ml-2 text-white">
                            Select All Amenities
                          </p>
                        </div>

                        <div className="flex max-h-[500px] flex-col gap-4 overflow-y-auto p-4 pt-0">
                          {amenitiesLoading ? (
                            <Loader2 size={40} className="animate-spin" />
                          ) : (
                            filteredAmenities?.map((amenity: any) => (
                              <div
                                key={amenity.Id}
                                className={`flex items-center gap-4 rounded p-3 ${
                                  field.value.includes(amenity.Id)
                                    ? "bg-cstm-primary text-white"
                                    : "bg-white/[.85] text-black"
                                } transition transition-all`}
                              >
                                <Checkbox
                                  checked={field.value.includes(amenity.Id)}
                                  onCheckedChange={() => {
                                    const newValue = field.value.includes(
                                      amenity.Id,
                                    )
                                      ? field.value.filter(
                                          (id) => id !== amenity.Id,
                                        )
                                      : [...field.value, amenity.Id];
                                    field.onChange(newValue);
                                  }}
                                  className="h-5 w-5 rounded border-0 border-cstm-primary transition transition-all data-[state=checked]:bg-white data-[state=unchecked]:bg-cstm-secondary data-[state=checked]:text-cstm-primary"
                                />
                                <div className="flex flex-col">
                                  <p
                                    className={`${
                                      field.value.includes(amenity.Id)
                                        ? "text-white"
                                        : "text-black"
                                    } font-semibold transition transition-all`}
                                  >
                                    {amenity.Label}
                                  </p>
                                  <p
                                    className={`${
                                      field.value.includes(amenity.Id)
                                        ? "text-white/[.70]"
                                        : "text-black/[.70]"
                                    } text-sm transition transition-all`}
                                  >
                                    {amenity.Description}
                                  </p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

const defaultDescription: string = ``;
